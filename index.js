var path = require('path')
require('babel-register')
require('app-module-path').addPath(path.resolve(__dirname, 'src'))
var server = require('server')
var logger = require('logging').logger

if(process.env.LOG_DIR) process.env.LOG_DIR = path.resolve(process.env.LOG_DIR)

process.on('unhandledRejection', function(reason, p) {
  logger.error('Unhandled ', p)
})

server.start(process.env.PORT || 5000)
