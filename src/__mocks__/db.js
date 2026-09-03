export const mysqlPool = {
  query: jest.fn().mockResolvedValue([[], []]),
  execute: jest.fn().mockResolvedValue([[], []]),
  getConnection: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue([[], []]),
    execute: jest.fn().mockResolvedValue([[], []]),
    release: jest.fn(),
  }),
  end: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
};