const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  clearMocks: true,
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
})
