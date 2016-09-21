import nock from 'nock'

import { expect, chai } from 'test-setup'

import { createScraper } from 'scraper'

describe('scraper', () => {
  const scraper = createScraper('http://nowhere/test')
  let n
  
  beforeEach(() => 
    n = nock('http://nowhere').get('/test').reply(400, 'Hello there'))
  
  afterEach(() => n.done())
  
  it('should make a request to the default URL when no other is specified', () => {
    const promise = scraper.get()
    
    return promise
  })
  
  it('should make a request to the specified URL', () => {
    const scraper = createScraper('http://www.google.com')
    const promise = scraper.get('http://nowhere/test')
    
    return promise
  })
  
  it('should return the HTML response and code', () => {
    const promise = scraper.get()
    
    return promise.then(result => {
      expect(result).to.have.deep.property('response.statusCode', 400)
      expect(result).to.have.property('html', 'Hello there')
    })
  })
  
  it('should pass the provided options to the options enhancer', () => {
    let spiedOptions
    let spy = chai.spy(options => spiedOptions = options)
    
    let scraper2 = scraper.enhance({
      options: spy
    })

    const promise = scraper2.get({someProp: 'someValue'})
    
    return promise.then(() => {
      expect(spy).to.have.been.called()
      expect(spiedOptions).to.have.property('url', 'http://nowhere/test')
      expect(spiedOptions).to.have.property('someProp', 'someValue')
    })
  })

  it('should use the options returned by the options enhancer', () => {
    let scraper = createScraper('http://www.google.com').enhance({
      options: () => ({url: 'http://nowhere/test'})
    })
    
    const promise = scraper.get()
    
    return promise
  })
  
  it('should call the response enhancer before returning the response', () => {
    let spiedResult
    let spiedOptions
    let spy = chai.spy((result, options) => {
      spiedResult = result
      spiedOptions = options
      return undefined
    })
    
    let scraper2 = scraper.enhance({
      result: spy
    })
    
    const promise = scraper2.get()
    
    return promise.then(result => {
      expect(spy).to.have.been.called()
      expect(spiedResult).to.be.equal(result)
      expect(spiedOptions).to.have.property('url', 'http://nowhere/test')
    })
  })
  
  it('should return the response as enhanced by the response enhancer', () => {
    let scraper2 = scraper.enhance({
      result: result => ({...result, enhanced: true})
    })
    
    const promise = scraper2.get()
    
    return promise.then(result => {
      expect(result).to.have.property('enhanced', true)
    })
  })
})