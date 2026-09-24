import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { authHandlers } from './msw-handlers';

export const server = setupServer(...authHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('react-hot-toast', () => ({
  toast: vi.fn(),
  Toaster: ({ children }: { children: React.ReactNode }) => children,
}));

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => null,
});