import nock from 'nock'

import { expect, chai } from 'test-setup'

import { Scraper } from 'scraper'

describe('scraper', () => {
  const scraper = new Scraper('http://nowhere/test')
  let n
  
  beforeEach(() => 
    n = nock('http://nowhere').get('/test').reply(400, 'Hello there'))
  
  it('should make a request to the default URL when no other is specified', () => {
    const promise = scraper.get()
    
    return promise.then(() => n.done())
  })
  
  it('should make a request to the specified URL', () => {
    const scraper = new Scraper('http://www.google.com')
    const promise = scraper.get('http://nowhere/test')
    
    return promise.then(() => n.done())
  })
  
  it('should return the HTML response and code', () => {
    const promise = scraper.get()
    
    return promise.then(result => {
      expect(result).to.have.deep.property('response.statusCode', 400)
      expect(result).to.have.property('html', 'Hello there')
    })
  })

  describe('enhancers', () => {
    it('should be called with the request options', () => {
      let options
      const scraper2 = scraper.use((o, next) => {
        options = o
        next()
      })
      
      scraper2.get('http://nowhere/test')
      
      return expect(options).to.have.property('url', 'http://nowhere/test')
    })
    
    it('should pass through the options to make the request', () => {
      const scraper2 = scraper.use((o, next) => next(o))
      
      const result = scraper2.get('http://nowhere/test')
      
      return result.then(() => n.done())
    })
    
    it('should pass the updated options to the inner request', () => {
      const scraper2 = scraper.use((o, next) => next({url: 'http://nowhere/test'}))
      
      const result = scraper2.get('http://somewhere/test')
      
      return result.then(() => n.done())
    })
    
    it('should call enhancers in reverse of the order they were added', () => {
      let called = []
      const scraper2 = scraper
        .use((o, next) => {called.push(1); next(o)})
        .use((o, next) => {called.push(2); next(o)})
        
      scraper2.get('http://nowhere/test')
      
      return expect(called).to.deep.equal([2, 1])
    })
    
    it('should use the previous call\'s options if the enhancer doesn\'t provide any', () => {
      const scraper2 = scraper
        .use((o, next) => next({url: 'http://nowhere/test'}))
        .use((o, next) => next())
      
      const result = scraper2.get('http://somewhere/test')
      
      return result.then(() => n.done())
    })
    
    it('should pass the options provided by an outer enhancer to the next enhancer', () => {
      let options
      const scraper2 = scraper
        .use((o, next) => {options = o; next()})
        .use((o, next) => next({...o, addedOption: true}))
        
      scraper2.get('http://nowhere/test')
      
      return expect(options).to.have.property('addedOption', true)
    })
    
    it('should return the result provided by the enhancer', () => {
      const scraper2 = scraper
        .use((o, next) => next(o).then(() => ({test: 'result'})))
        
      const result = scraper2.get('http://nowhere/test')
      
      return expect(result).to.eventually.deep.equal({test: 'result'})
    })
    
    it('should resolve enhancers in the order they were added', () => {
      let called = []
      const scraper2 = scraper
        .use((o, next) => next(o).then(called.push(1)))
        .use((o, next) => next(o).then(called.push(2)))
        
      const result = scraper2.get('http://nowhere/test')
      
      return result.then(() => expect(called).to.deep.equal([1, 2]))
    })
    
    it('should pass through results to subsequent enhancers', () => {
      const scraper2 = scraper
        .use((o, next) => next(o).then(() => 'Hello!'))
        .use((o, next) => next(o).then(r => ({enhancer2Got: r})))
        
      const result = scraper2.get('http://nowhere/test')
      
      return expect(result).to.eventually.deep.equal({enhancer2Got: 'Hello!'})
    })
    
    it('should get the scraper as an argument', () => {
      let enhancerGotScraper
      const scraper2 = scraper
        .use((o, next, scraper) => {enhancerGotScraper = scraper; return next(o)})
        
      scraper2.get('http://nowhere/test')
      
      return expect(enhancerGotScraper).to.equal(scraper2)
    })
  })
})