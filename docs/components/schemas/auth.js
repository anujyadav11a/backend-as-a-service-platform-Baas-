export const authSchemas = {
  RegisterRequest: {
    type: 'object',
    required: ['email', 'password', 'name'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      password: { type: 'string', format: 'password', minLength: 8, example: 'securePassword123' },
      name: { type: 'string', minLength: 1, maxLength: 100, example: 'John Doe' }
    }
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      password: { type: 'string', format: 'password', example: 'securePassword123' }
    }
  },
  TenantRegisterRequest: {
    type: 'object',
    required: ['email', 'password', 'name'],
    properties: {
      email: { type: 'string', format: 'email', example: 'tenant@example.com' },
      password: { type: 'string', format: 'password', minLength: 8, example: 'securePassword123' },
      name: { type: 'string', minLength: 1, maxLength: 100, example: 'Jane Doe' }
    }
  },
  TenantLoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'tenant@example.com' },
      password: { type: 'string', format: 'password', example: 'securePassword123' }
    }
  },
  RefreshTokenRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
    }
  },
  LogoutRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
    }
  },
  RevokeSessionRequest: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string', example: 'sess_abc123' }
    }
  },
  TokenResponse: {
    type: 'object',
    required: ['accessToken', 'refreshToken', 'user'],
    properties: {
      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      user: {
        type: 'object',
        required: ['id', 'email'],
        properties: {
          id: { type: 'string', example: 'user_abc123' },
          email: { type: 'string', example: 'user@example.com' },
          name: { type: 'string', example: 'John Doe' }
        }
      }
    }
  },
  UserResponse: {
    type: 'object',
    required: ['id', 'email', 'name'],
    properties: {
      id: { type: 'string', example: 'user_abc123' },
      email: { type: 'string', example: 'user@example.com' },
      name: { type: 'string', example: 'John Doe' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  SessionResponse: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      userId: { type: 'string' },
      userAgent: { type: 'string' },
      ip: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      expiresAt: { type: 'string', format: 'date-time' }
    }
  },
  SessionsResponse: {
    type: 'object',
    properties: {
      sessions: {
        type: 'array',
        items: { $ref: '#/components/schemas/SessionResponse' }
      }
    }
  },
  OAuthProvidersResponse: {
    type: 'object',
    properties: {
      providers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            provider: { type: 'string', enum: ['google'] },
            providerId: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            picture: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }
};