// src/__tests__/client/setup.ts
import '@testing-library/jest-dom';

// Mock fetch for client-side tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: 'success' }),
    status: 200,
  })
) as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

//src/__tests__/client/components/setup.ts