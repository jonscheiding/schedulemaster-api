import mlog from 'mocha-logger'
import path from 'path'

const modulePaths = require('app-module-path')
modulePaths.addPath(path.resolve(__dirname, '../src'))
modulePaths.addPath(__dirname)

const chai = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-spies'))

const expect = chai.expect
  
Promise.prototype.log = function() {
  return this
    .then(value => {
      mlog.log(JSON.stringify(value))
      return value
    })
    .catch(err => {
      mlog.log(err)
      return Promise.reject(err)
    })
}

export { chai, expect }