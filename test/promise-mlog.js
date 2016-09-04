import mlog from 'mocha-logger'

Promise.prototype.log = function() {
  return this
    .then(value => {
      mlog.log(value)
      return value
    })
    .catch(err => {
      mlog.log(err)
      return Promise.reject(err)
    })
}