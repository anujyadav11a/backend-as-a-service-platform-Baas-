export const redis = {
  ping: jest.fn().mockResolvedValue('PONG'),
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue('OK'),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
};