let create = require('../../jest/create-jest-config.cjs')
module.exports = create(__dirname, {
  displayName: ' CSS ',
  setupFilesAfterEnv: ['./jest.setup.js'],
})
