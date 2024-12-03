// jest.common.config.ts
const commonConfig = {
    preset: 'ts-jest',
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {
        tsconfig: 'tsconfig.json'
      }]
    },
    moduleDirectories: ['node_modules']
  };
  
  export default commonConfig;