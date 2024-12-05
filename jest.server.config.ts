// jest.server.config.ts
import commonConfig from './jest.common.config';

export default {
  ...commonConfig,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/server/setup.ts'],
  testMatch: ['**/__tests__/server/**/*.test.[jt]s?(x)']
};