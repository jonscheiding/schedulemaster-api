import arrayWrap from 'array-wrap'
import extend from 'deep-extend'

import request from './request-wrapper'
import { defaults as defaultEnhancers } from './enhancers'

const cleanOptions = optionsOrUrl => 
  typeof(optionsOrUrl) === 'string' ? {url: optionsOrUrl} : optionsOrUrl

class Scraper {
  constructor(options, enhancers = []) {
    this.defaultOptions = options
    this.enhancers = arrayWrap(enhancers)
    
    for(let enhancer of this.enhancers) {
      if(typeof(enhancer) !== 'function') throw new Error(`Enhancer ${enhancer} is not a function.`)
    }
    
    ['get', 'post'].forEach(method => 
      this[method] = this.execute.bind(this, method)
    )
  }
  
  wrapWithEnhancer(initialOptions, inner, enhancer) {
    const next = (enhancedOptions = initialOptions) => 
    inner(enhancedOptions)
    
    return (options = initialOptions) => 
      enhancer(options, next, this)
  }
  
  execute(method, options) {
    let finalOptions = extend(
      cleanOptions(this.defaultOptions),
      cleanOptions(options)
    )
    
    finalOptions = {...finalOptions, method}
    let makeRequest = (o) => {
      return request(o)
    }
    
    for(let enhancer of this.enhancers) {
      makeRequest = this.wrapWithEnhancer(finalOptions, makeRequest, enhancer)
    }
    
    return makeRequest(finalOptions)
  }
  
  use(enhancers) {
    return new Scraper(
      this.defaultOptions, 
      [...this.enhancers, ...arrayWrap(enhancers)]
    )
  }
}

const createScraper = (defaultOptions, ...enhancers) =>
  new Scraper(defaultOptions, [...defaultEnhancers, ...arrayWrap(enhancers)])

export default createScraper
export { Scraper }