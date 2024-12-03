// src/__tests__/setup.ts
import '@testing-library/jest-dom';

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
) as jest.Mock;

// Mock browser APIs
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = jest.fn();
}

//src/__tests__/setup.ts