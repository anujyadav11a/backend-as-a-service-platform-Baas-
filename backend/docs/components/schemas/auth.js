export const authSchemas = {
  RegisterRequest: {
    type: 'object',
    required: ['email', 'password', 'name'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      password: { type: 'string', format: 'password', minLength: 6, example: 'securePass' },
      name: { type: 'string', minLength: 2, maxLength: 50, example: 'John Doe' }
    }
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      password: { type: 'string', format: 'password', minLength: 1, example: 'securePass' }
    }
  },
  TenantRegisterRequest: {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 30, example: 'janedoe' },
      email: { type: 'string', format: 'email', example: 'tenant@example.com' },
      password: { type: 'string', format: 'password', minLength: 6, example: 'securePass' }
    }
  },
  TenantLoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'tenant@example.com' },
      password: { type: 'string', format: 'password', minLength: 1, example: 'securePass' }
    }
  },
  RefreshTokenRequest: {
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
  LoginResponse: {
    type: 'object',
    required: ['user', 'session', 'tokens'],
    properties: {
      user: {
        type: 'object',
        required: ['id', 'email', 'name'],
        properties: {
          id: { type: 'string', example: 'user_abc123' },
          email: { type: 'string', example: 'user@example.com' },
          name: { type: 'string', example: 'John Doe' }
        }
      },
      session: {
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
      tokens: {
        type: 'object',
        required: ['accessToken', 'refreshToken', 'sessionToken'],
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          sessionToken: { type: 'string', example: 'sess_abc123' }
        }
      }
    }
  },
  RefreshTokenResponse: {
    type: 'object',
    required: ['tokens'],
    properties: {
      tokens: {
        type: 'object',
        required: ['accessToken', 'refreshToken', 'sessionToken'],
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          sessionToken: { type: 'string', example: 'sess_abc123' }
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
  },
  OAuthLoginResponse: {
    type: 'object',
    required: ['user', 'tokens', 'session', 'oauth'],
    properties: {
      user: { $ref: '#/components/schemas/UserResponse' },
      tokens: {
        type: 'object',
        required: ['accessToken', 'refreshToken', 'sessionToken'],
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          sessionToken: { type: 'string', example: 'sess_abc123' }
        }
      },
      session: { $ref: '#/components/schemas/SessionResponse' },
      oauth: {
        type: 'object',
        properties: {
          provider: { type: 'string', example: 'google' },
          providerId: { type: 'string' }
        }
      }
    }
  }
};