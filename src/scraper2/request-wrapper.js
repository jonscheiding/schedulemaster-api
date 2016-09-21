import request from 'request'

import { logger } from 'logging'

const requestWrapper = (options) => new Promise(
  (resolve, reject) => {
    request(options, (error, response, html) => {
      if(error) return reject(error)
      logger.debug({options, url: response.request.uri.href, body: response.request.body}, 'Performed HTTP request.')
      logger.debug({html}, 'Got HTML response.')
      
      resolve({
        response: response,
        html: html
      })
    })
  }
)

export default requestWrapper