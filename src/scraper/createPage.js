import cheerio from 'cheerio'
import request from 'request'
import url from 'url'
import { addQueryToUrl, isSuccessStatusCode } from 'scraper/utils'

const createPage = (urlStr) => token => {
  const makeRequest = (method, options) => {
    const parsedUrl = addQueryToUrl(url.parse(urlStr, true), token)
    options = { method: method, uri: url.format(parsedUrl), ...options }

    return new Promise(
      (resolve, reject) => {
        request(options, (error, response, html) => {
          if(error) return reject(error)
          if(!isSuccessStatusCode(response.statusCode)) {
            return reject(response.statusCode, response)
          }
          
          const $ = cheerio.load(html)
          resolve($)
        })
      }
      
    )
  }
  
  return {
    makeRequest,
    get: makeRequest.bind(null, 'get'),
    post: makeRequest.bind(null, 'post')
  }
}

export default createPage