module.exports = {
  rootDir: 'test/frontend',
  transform: {
    '.*': '<rootDir>/../../node_modules/babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/../../coverage/ui',
  transformIgnorePatterns: ['node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates)'],
};
