const chai = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-spies'))
import nock from 'nock'
import sinon from 'sinon'

const expect = chai.expect

import { createScraper } from 'scraper2'

describe('scraper', () => {
  const scraper = createScraper('http://nowhere/test')
  let n
  
  beforeEach(() => 
    n = nock('http://nowhere').get('/test').reply(400, 'Hello there'))
  
  afterEach(() => n.done())
  
  it('should make a request to the default URL when no other is specified', () => {
    const promise = scraper()
    
    return promise
  })
  
  it('should make a request to the specified URL', () => {
    const scraper2 = createScraper('http://www.google.com')
    const promise = scraper2('http://nowhere/test')
    
    return promise
  })
  
  it('should return the HTML response and code', () => {
    const promise = scraper()
    
    return promise.then(result => {
      expect(result).to.have.deep.property('response.statusCode', 400)
      expect(result).to.have.property('html', 'Hello there')
    })
  })
  
  it('should call the options enhancer before making the request', () => {
    let spy = chai.spy()
    
    let scraper2 = scraper.enhance({
      options: spy
    })

    const promise = scraper2()
    
    return promise.then(() => {
      expect(spy).to.have.been.called()
    })
  })
  
  it('should use the options returned by the options enhancer', () => {
    let scraper2 = createScraper('http://www.google.com').enhance({
      options: () => ({url: 'http://nowhere/test'})
    })
    
    const promise = scraper2()
    
    return promise
  })

})