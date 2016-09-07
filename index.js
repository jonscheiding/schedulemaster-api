var path = require('path')
require('app-module-path').addPath(path.resolve(__dirname, 'src'))
require('server')

process.on('unhandledRejection', function(reason, p) {
  console.log('Unhandled ', p)
})