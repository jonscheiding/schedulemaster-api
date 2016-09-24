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
  
  execute(method, options) {
    let actualOptions = extend(
      cleanOptions(this.defaultOptions),
      cleanOptions(options)
    )
    
    actualOptions = {...actualOptions, method}
    const remainingEnhancers = [...this.enhancers]
    
    //
    // Implement a connect() like middleware style for enhancers.  Enhancers
    // look like this:
    //  (options, next, scraper) => next(options).then(r => r)
    //
    // Enhancers can change the options before passing them to next(), and they
    // can then() or catch() on the promise.  If the enhancer passes undefined
    // to next(), the options should pass through.
    //
    // This method accomplishes that with a closure on actualOptions.  Every
    // time an enhancer calls next(), the provided options are set into this 
    // var.  The var is used as the default in case the enhancer didn't pass
    // anything.
    // 
    const next = (nextOptions = actualOptions) => {
      actualOptions = nextOptions
      const enhancer = remainingEnhancers.pop()
      if(enhancer) {
        return enhancer(nextOptions, next, this)
      }
      return request(nextOptions)
    }
    
    return next(actualOptions)
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