import extend from 'deep-extend'
import request from './request-wrapper'

const cleanOptions = optionsOrUrl => 
  typeof(optionsOrUrl) === 'string' ? {url: optionsOrUrl} : optionsOrUrl

const noop = arg => arg

const createScraper = (defaultOptions, enhancers = []) => {
  const scraper = (options) => {
    let finalOptions = extend(
      cleanOptions(defaultOptions),
      cleanOptions(options)
    )
        
    enhancers.forEach(enhancer =>
      finalOptions = (enhancer.options || noop)(finalOptions) || finalOptions
    )
        
    let result = request(finalOptions)
    
    enhancers.forEach(enhancer => 
      result = result.then(enhancer.result || noop)
    )
    
    return result
  }
  
  scraper.enhance = enhancer => createScraper(defaultOptions, [...enhancers, enhancer])
  return scraper
}

export default createScraper