import cheerio from 'cheerio'
import request from 'request'
import objectMap from 'object-map'
import deepExtend from 'deep-extend'

import { logger } from 'logging'
import { isSuccessStatusCode, addQueryToUrl } from 'scraper/utils'

const requestPromise = options => new Promise(
  (resolve, reject) => {
    request(options, (error, response, html) => {
      if(error) return reject({error: error})
      if(!isSuccessStatusCode(response.statusCode)) return reject({response: response})
      
      logger.debug({html: html.substring(20)})
      
      const $ = cheerio.load(html)
      resolve({$, response})
    })
  }
)

const enhance = (enhancers, page) => result => {
  if(!enhancers) return result
  const r = ({
    ...result,
    ...objectMap(enhancers, enhanceFn => enhanceFn(result.$, page))
  })
  return r
}

const createPage = (staticOptions, resultEnhancers) => (token, instanceOptions) => {
  if(typeof staticOptions === 'string') {
    staticOptions = {url: staticOptions}
  }
  
  const page = (method, requestOptions) => {
    const options = deepExtend(
      { method: method, qs: token.query },
      staticOptions, instanceOptions, requestOptions
    )
    
    //
    // Doing this here because request doesn't seem to be respecting qs in the options
    //
    options.url = addQueryToUrl(options.url, options.qs)
    
    return requestPromise(options).then(enhance(resultEnhancers, page))
  }
  
  page.get = page.bind(this, 'get')
  page.post = page.bind(this, 'post')
  return page
}

export default createPage