module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/{!(Globals|index|inversify),}.ts',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
};
