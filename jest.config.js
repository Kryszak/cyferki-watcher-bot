module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/{!(Globals|index|inversify),}.ts',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  silent: true,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ]
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
};
