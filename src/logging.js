import bunyan from 'bunyan'

const logger = bunyan.createLogger({
  name: 'sm-api',
  level: bunyan.DEBUG,
  serializers: bunyan.stdSerializers
})

export { logger }