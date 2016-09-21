import arrayWrap from 'array-wrap'
import extend from 'deep-extend'

import request from './request-wrapper'
import { defaults as defaultEnhancers } from './enhancers'
import { logger } from 'logging'

const cleanOptions = optionsOrUrl => 
  typeof(optionsOrUrl) === 'string' ? {url: optionsOrUrl} : optionsOrUrl

class Scraper {
  constructor(options, enhancers = []) {
    this.defaultOptions = options
    this.enhancers = arrayWrap(enhancers)
    
    ;['get', 'post'].forEach(method => 
      this[method] = this.execute.bind(this, method)
    )
  }
  
  applyEnhancers(select, apply) {
    this.enhancers.forEach(enhancer => {
      const fn = select(enhancer)
      if(fn) apply(fn)
    })
  }

  enhanceOptions(options) {
    this.applyEnhancers(
      enhancer => enhancer.options,
      fn => options = fn(options) || options
    )
      
    return options
  }
  
  enhanceResult(result, options) {
    this.applyEnhancers(
      enhancer => enhancer.result,
      fn => result = result.then(r => fn(r, options, this) || r)
    )
    return result
  }
  
  execute(method, options) {
    let finalOptions = extend(
      cleanOptions(this.defaultOptions),
      cleanOptions(options)
    )
    
    finalOptions = {method, ...finalOptions}    
    finalOptions = this.enhanceOptions(finalOptions)
        
    let result = request(finalOptions)
    
    result = this.enhanceResult(result, finalOptions)
    
    return result
  }
  
  enhance(enhancers) {
    return new Scraper(
      this.defaultOptions, 
      [...this.enhancers, ...arrayWrap(enhancers)]
    )
  }
}

const createScraper = (defaultOptions, enhancers = []) =>
  new Scraper(defaultOptions, [...defaultEnhancers, ...arrayWrap(enhancers)])

export default createScraper
export { Scraper }