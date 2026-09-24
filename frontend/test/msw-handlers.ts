import { http, HttpResponse, delay } from 'msw';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
};

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  sessionToken: 'mock-session-token',
};

const mockSession = {
  id: 'session-123',
  ip_address: '127.0.0.1',
  device_info: { browser: 'Chrome', os: 'Windows' },
  location: { city: 'Test City', country: 'Test Country' },
  login_method: 'email',
  last_activity: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

const mockSessions = [
  { ...mockSession, id: 'session-1', current: true },
  { ...mockSession, id: 'session-2', current: false },
];

const errorResponses = {
  USER_EXISTS: { success: false, error: { code: 'USER_EXISTS', message: 'An account with this email already exists' } },
  INVALID_CREDENTIALS: { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
  TOKEN_EXPIRED: { success: false, error: { code: 'TOKEN_EXPIRED', message: 'Session expired, please login again' } },
  UNAUTHORIZED: { success: false, error: { code: 'UNAUTHORIZED', message: 'Please login to continue' } },
  FORBIDDEN: { success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' } },
  NOT_FOUND: { success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } },
  VALIDATION_ERROR: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Please check your input and try again' } },
};

function getAuthCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));
  return refreshCookie ? refreshCookie.split('=')[1] : null;
}

function isAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  return !!authHeader && authHeader.startsWith('Bearer ');
}

export const authHandlers = [
  http.post('/users/register', async ({ request }) => {
    await delay(100);
    const body = await request.json();

    if (!body.email || !body.password || !body.name) {
      return HttpResponse.json(errorResponses.VALIDATION_ERROR, { status: 400 });
    }

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(errorResponses.USER_EXISTS, { status: 409 });
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          user: { ...mockUser, email: body.email, name: body.name },
          tokens: mockTokens,
          session: mockSession,
        },
      },
      { status: 201 }
    );
  }),

  http.post('/users/login', async ({ request }) => {
    await delay(100);
    const body = await request.json();

    if (!body.email || !body.password) {
      return HttpResponse.json(errorResponses.VALIDATION_ERROR, { status: 400 });
    }

    if (body.email === 'wrong@example.com' || body.password === 'wrong') {
      return HttpResponse.json(errorResponses.INVALID_CREDENTIALS, { status: 401 });
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokens,
          session: mockSession,
        },
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': 'refreshToken=mock-refresh-token; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800',
        },
      }
    );
  }),

  http.post('/users/refresh', async ({ request }) => {
    await delay(50);
    const refreshToken = getAuthCookie(request);

    if (!refreshToken || refreshToken !== 'mock-refresh-token') {
      return HttpResponse.json(errorResponses.TOKEN_EXPIRED, { status: 401 });
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          tokens: { ...mockTokens, accessToken: 'new-mock-access-token' },
        },
      },
      { status: 200 }
    );
  }),

  http.post('/users/logout', async ({ request }) => {
    await delay(50);

    if (!isAuthenticated(request)) {
      return HttpResponse.json(errorResponses.UNAUTHORIZED, { status: 401 });
    }

    return HttpResponse.json(
      { success: true, data: { message: 'Logged out successfully' } },
      {
        status: 200,
        headers: {
          'Set-Cookie': 'refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
        },
      }
    );
  }),

  http.get('/users/me', async ({ request }) => {
    await delay(50);

    if (!isAuthenticated(request)) {
      return HttpResponse.json(errorResponses.UNAUTHORIZED, { status: 401 });
    }

    return HttpResponse.json(
      { success: true, data: mockUser },
      { status: 200 }
    );
  }),

  http.get('/users/sessions', async ({ request }) => {
    await delay(50);

    if (!isAuthenticated(request)) {
      return HttpResponse.json(errorResponses.UNAUTHORIZED, { status: 401 });
    }

    return HttpResponse.json(
      { success: true, data: mockSessions },
      { status: 200 }
    );
  }),

  http.delete('/users/sessions/:id', async ({ request, params }) => {
    await delay(50);

    if (!isAuthenticated(request)) {
      return HttpResponse.json(errorResponses.UNAUTHORIZED, { status: 401 });
    }

    const sessionId = params.id as string;
    const sessionExists = mockSessions.some(s => s.id === sessionId);

    if (!sessionExists) {
      return HttpResponse.json(errorResponses.NOT_FOUND, { status: 404 });
    }

    return HttpResponse.json(
      { success: true, data: { sessionId, message: 'Session revoked' } },
      { status: 200 }
    );
  }),
];

export const errorHandlers = {
  registerConflict: http.post('/users/register', () => HttpResponse.json(errorResponses.USER_EXISTS, { status: 409 })),
  loginInvalid: http.post('/users/login', () => HttpResponse.json(errorResponses.INVALID_CREDENTIALS, { status: 401 })),
  refreshExpired: http.post('/users/refresh', () => HttpResponse.json(errorResponses.TOKEN_EXPIRED, { status: 401 })),
  unauthorized: [
    http.get('/users/me', () => HttpResponse.json(errorResponses.UNAUTHORIZED, { status: 401 })),
    http.get('/users/sessions', () => HttpResponse.json(errorResponses.UNAUTHORIZED, { status: 401 })),
    http.delete('/users/sessions/:id', () => HttpResponse.json(errorResponses.UNAUTHORIZED, { status: 401 })),
    http.post('/users/logout', () => HttpResponse.json(errorResponses.UNAUTHORIZED, { status: 401 })),
  ],
  serverError: [
    http.post('/users/register', () => HttpResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })),
    http.post('/users/login', () => HttpResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })),
    http.post('/users/refresh', () => HttpResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })),
  ],
  networkError: [
    http.post('/users/register', () => HttpResponse.error()),
    http.post('/users/login', () => HttpResponse.error()),
  ],
};