import request from 'request'

const requestWrapper = (url, options) => new Promise(
  (resolve, reject) => {
    request(url, options, (error, response, html) => {
      if(error) return reject(error)
      
      resolve({
        response: response,
        html: html
      })
    })
  }
)

const requestMethod = (method, url, options) => 
  requestWrapper(url, {
    method,
    ...options
  })
  
;['get', 'post'].forEach(method => 
  requestWrapper[method] = requestMethod.bind(method, 'get')
)

export default requestWrapper