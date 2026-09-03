import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.json' }],
  },
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/migrations/**',
    '!src/**/*.docs.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^(\\.{1,2}/shared/config/redis\\.config)\\.js$': '<rootDir>/src/__mocks__/redis.config.js',
    '^(\\.{1,2}/shared/config/db)\\.js$': '<rootDir>/src/__mocks__/db.js',
    '^ioredis$': '<rootDir>/src/__mocks__/ioredis.js',
  },
transformIgnorePatterns: [
    '/node_modules/(?!(uuid|@sinonjs|ioredis|@babel)($|/))',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};