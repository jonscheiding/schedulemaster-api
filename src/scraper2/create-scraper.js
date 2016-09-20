import arrayWrap from 'array-wrap'
import extend from 'deep-extend'

import request from './request-wrapper'

const cleanOptions = optionsOrUrl => 
  typeof(optionsOrUrl) === 'string' ? {url: optionsOrUrl} : optionsOrUrl

const applyEnhancers = (enhancers, select, apply) => {
  arrayWrap(enhancers).forEach(enhancer => {
    const fn = select(enhancer)
    if(fn) apply(fn)
  })
}

const createScraper = (defaultOptions, enhancers = []) => {
  const scraper = (options) => {
    let finalOptions = extend(
      cleanOptions(defaultOptions),
      cleanOptions(options)
    )
        
    applyEnhancers(enhancers, 
      enhancer => enhancer.options,
      fn => finalOptions = fn(finalOptions) || finalOptions
    )
        
    let result = request(finalOptions)
    
    applyEnhancers(enhancers,
      enhancer => enhancer.result,
      fn => result = result.then(r => fn(r, finalOptions) || r)
    )
    
    return result
  }
  
  ;['post', 'get'].forEach(method => {
    scraper[method] = options => scraper({method, ...options})
  })
  
  scraper.enhance = newEnhancers => createScraper(defaultOptions, [...enhancers, ...arrayWrap(newEnhancers)])
  return scraper
}

export default createScraper