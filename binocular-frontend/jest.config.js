export default {
  roots: ['<rootDir>'],
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['<rootDir>/test/**'],
  modulePaths: ['<rootDir>'],
  transformIgnorePatterns: ['node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates)'],
  moduleDirectories: ['node_modules'],
};
