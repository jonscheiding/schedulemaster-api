var path = require('path')
require('babel-register')
require('app-module-path').addPath(path.resolve(__dirname, 'src'))

if(process.env.LOG_DIR) process.env.LOG_DIR = path.resolve(process.env.LOG_DIR)

require('server')

process.on('unhandledRejection', function(reason, p) {
  console.log('Unhandled ', p)
})