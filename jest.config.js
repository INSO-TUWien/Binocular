module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['<rootDir>/test/frontend/**'],
  modulePaths: ['<rootDir>'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates)'],
  moduleDirectories: ['node_modules'],
};
