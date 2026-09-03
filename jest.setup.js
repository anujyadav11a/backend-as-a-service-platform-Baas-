import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:3000';

export {};