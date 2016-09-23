import { expect } from 'test-setup'
import { token as tokenEnhancer } from 'scraper/enhancers'

describe('tokenEnhancer', () => {
  const token = {query: {ab: 'cd'}}
  
  it('should set the token query as the query string', () => {
    const options = { token }
    let options2
    
    tokenEnhancer(options, o => options2 = o)
    
    expect(options2).to.have.property('qs')
      .and.deep.equal(options.token.query)
  })
  
  it('should add the token query to the query string if it already exists', () => {
    const options = { token, qs: {ef: 'gh'} }
    let options2
    
    tokenEnhancer(options, o => options2 = o)
    
    expect(options2).to.have.property('qs')
      .and.deep.equal({...options.token.query, ...options.qs})
  })
  
  it('should do nothing if no token is provided', () => {
    const options = {}
    let options2
    
    tokenEnhancer(options, o => options2 = o)
    
    expect(options2).to.equal(options)
  })
})