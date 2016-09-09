import bunyan from 'bunyan'
import fs from 'fs'
import path from 'path'
import uuid from 'node-uuid'

const serializeToFile = content => {
  if(!process.env.LOG_DIR) return null
  
  //
  // When HTML is logged, dump it to a file instead of the console so it's easier
  // to review
  //
  
  const filename = uuid.v4() + '.log'
  const filepath = path.resolve(process.env.LOG_DIR, filename)
  
  fs.writeFile(filepath, content, err => {
    if(err) logger.error('Error writing content to logs.', {err})
  })
  
  return filename
}

const formSerializer = form => {
  if(!form) return form

  //
  // Strip the __VIEWSTATE and __EVENTVALIDATION fields from the form because 
  // they are noisy and useless
  //
  // eslint-disable-next-line no-unused-vars
  const { __VIEWSTATE, __EVENTVALIDATION, ...rest } = form 
  return rest
}

const optionsSerializer = options => {
  if(!options || !options.url || !options.form) return options
  return { ...options, form: formSerializer(options.form) }
}

const logger = bunyan.createLogger({
  name: 'sm-api',
  level: bunyan.DEBUG,
  serializers: {
    ...bunyan.stdSerializers,
    html: serializeToFile,
    body: serializeToFile,
    options: optionsSerializer,
    form: formSerializer,
  }
})

export { logger }