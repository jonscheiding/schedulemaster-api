import deepmerge from 'deepmerge'
import { logger } from 'logging'

export default (options, next) => {
  if(!options || !options.token) {
    logger.debug('No token provided for request.')
    return options
  }
  
  logger.info({token: options.token}, 'Adding token to request.')
  
  const { token, ...optionsWithoutToken } = options
  options = deepmerge(
    optionsWithoutToken,
    { qs: token.query }
  )
  
  return next(options)
}