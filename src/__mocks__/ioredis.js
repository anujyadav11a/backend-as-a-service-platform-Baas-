const mockRedis = {
  on: jest.fn(),
  ping: jest.fn().mockResolvedValue('PONG'),
  quit: jest.fn().mockResolvedValue('OK'),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  expire: jest.fn().mockResolvedValue(1),
  eval: jest.fn().mockResolvedValue(1),
  keys: jest.fn().mockResolvedValue([]),
  flushall: jest.fn().mockResolvedValue('OK'),
};

export default jest.fn(() => mockRedis);
export const Redis = jest.fn(() => mockRedis);