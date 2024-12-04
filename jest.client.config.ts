// jest.client.config.ts
import commonConfig from './jest.common.config';

export default {
  ...commonConfig,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/client/setup.ts'],
  testMatch: ['**/__tests__/client/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  }
};