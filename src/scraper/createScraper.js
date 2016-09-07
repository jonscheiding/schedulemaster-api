import request from 'request'
import cheerio from 'cheerio'
import url from 'url'

import { addQueryToUrl, isSuccessStatusCode } from 'scraper/utils'

const executeRequest = options => new Promise(
  (resolve, reject) => {
    request(options, (error, response, html) => {
      if(error) return reject(error)
      if(!isSuccessStatusCode(response.statusCode))
        return reject(response.statusCode, response)
        
      const $ = cheerio.load(html)
      
      resolve({$, response})
    })
  }
)

const createScraper = (urlStr, builder = methods => methods) => token => {
  const parsedUrl = addQueryToUrl(url.parse(urlStr, true), token)
  
  const request = (options) => {
    options = {...options, uri: url.format(parsedUrl)}
    
    return executeRequest(options)
      .catch(err => {
        console.log(err)
        return Promise.reject(err)
      })
  }
    
  return builder({
    get: () => request({method: 'GET'}),
    post: (form) => request({method: 'POST', form: form})
  })
}

export default createScraper