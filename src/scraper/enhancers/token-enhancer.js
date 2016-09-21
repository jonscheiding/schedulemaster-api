import { logger } from 'logging'

export default {
  options: options => {
    if(!options || !options.token) {
      logger.debug('No token provided for request.')
      return options
    }
    
    logger.info({token: options.token}, 'Adding token to request.')
    
    const { token, ...otherOptions } = options
    
    return {
      ...otherOptions,
      qs: {
        ...otherOptions.qs,
        ...token.query
      }
    }
  }
}