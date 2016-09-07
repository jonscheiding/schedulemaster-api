import request from 'request'
import cheerio from 'cheerio'
import url from 'url'

const isSuccessStatusCode = statusCode => statusCode >= 200 && statusCode < 300

const scrapeRequest = options => new Promise(
  (resolve, reject) => 
    request(options, (error, response, html) => {
      if(error) return reject(error)
      if(!isSuccessStatusCode(response.statusCode))
        return reject(response.statusCode, response)
        
      const $ = cheerio.load(html)
      
      resolve({$, response})
    })
)

const addQueryToUrl = (parsedUrl, query) => (
  {
    ...parsedUrl,
    query: {
      ...parsedUrl.query,
      ...query
    },
    search: undefined
  }
)

const createScraper = (urlStr, promiseFn) => token => {
  const parsedUrl = addQueryToUrl(url.parse(urlStr, true), token)
  const options = {
    method: 'GET',
    uri: url.format(parsedUrl)    
  }
  
  return promiseFn(scrapeRequest(options)).catch(err => {
    console.log(err)
    return Promise.reject(err)
  })
}

export { createScraper }