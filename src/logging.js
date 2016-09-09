import bunyan from 'bunyan'
import fs from 'fs'
import path from 'path'
import uuid from 'node-uuid'

const htmlSerializer = html => {
  if(!process.env.LOG_DIR) return null
  
  //
  // When HTML is logged, dump it to a file instead of the console so it's easier
  // to review
  //
  
  const filename = uuid.v4() + '.html'
  const filepath = path.resolve(process.env.LOG_DIR, filename)
  
  fs.writeFile(filepath, html, err => {
    if(err) logger.error('Error writing HTML to logs.', {err})
  })
  
  return filename
}

const optionsSerializer = options => {
  if(!options.url || !options.form) return options
  
  //
  // Strip the __VIEWSTATE and __EVENTVALIDATION fields from the form because 
  // they are noisy and useless
  //
  // eslint-disable-next-line no-unused-vars
  const { __VIEWSTATE, __EVENTVALIDATION, ...form } = options.form 
  return { ...options, form }
}

const logger = bunyan.createLogger({
  name: 'sm-api',
  level: bunyan.DEBUG,
  serializers: {
    ...bunyan.stdSerializers,
    html: htmlSerializer,
    options: optionsSerializer
  }
})

export { logger }