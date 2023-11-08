export default {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['<rootDir>/test/frontend/**'],
  modulePaths: ['<rootDir>'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates)'],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/ui',
};
