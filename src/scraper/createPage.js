import cheerio from 'cheerio'
import request from 'request'
import objectMap from 'object-map'
import deepExtend from 'deep-extend'

import { isSuccessStatusCode, addQueryToUrl } from 'scraper/utils'

const requestPromise = options => new Promise(
  (resolve, reject) => {
    request(options, (error, response, html) => {
      if(error) return reject({error: error})
      if(!isSuccessStatusCode(response.statusCode)) return reject({response: response})
      
      const $ = cheerio.load(html)
      resolve({$, response})
    })
  }
)

const addSpecs = (specs, page) => result => {
  const r = ({
    ...result,
    ...objectMap(specs, specFn => specFn(result.$, page))
  })
  return r
}

const createPage = (url, staticOptions, resultSpecs) => (token, instanceOptions) => {
  const page = (method, requestOptions) => {
    const options = deepExtend(
      { method: method, url: url, qs: token.query },
      staticOptions, instanceOptions, requestOptions
    )
    
    //
    // Doing this here because request doesn't seem to be respecting qs in the options
    //
    options.url = addQueryToUrl(options.url, options.qs)
    
    return requestPromise(options).then(addSpecs(resultSpecs, page))
  }
  
  page.get = page.bind(this, 'get')
  page.post = page.bind(this, 'post')
  return page
}

export default createPage