const config = {
  app: {
    port: parseInt(process.env.PORT, 10) || 20000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  },

  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
  },

  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenLife: process.env.ACCESS_TOKEN_LIFE || '15m',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenLife: process.env.REFRESH_TOKEN_LIFE || '7d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_CALLBACK_URL,
  },

  oauth: {
    encryptionKey: process.env.OAUTH_ENCRYPTION_KEY,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },

  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
  },

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.DB_NAME || 'frontier',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@frontier.local',
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || 'Frontier Admin',
  },

  session: {
    secret: process.env.SESSION_SECRET,
  },
};

export default config;