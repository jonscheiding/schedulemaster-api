import deepmerge from 'deepmerge'
import { logger } from 'logging'

export default (options, next) => {
  if(!options || !options.session) {
    logger.debug('No SM session provided for request.')
    return next(options)
  }
  
  logger.info({session: options.session}, 'Adding session to request.')
  
  const { session, ...optionsWithoutSession } = options
  options = deepmerge(
    optionsWithoutSession,
    { qs: session }
  )
  
  return next(options)
}