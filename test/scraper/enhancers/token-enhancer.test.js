const chai = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-spies'))
  
const expect = chai.expect

import { token as tokenEnhancer } from 'scraper2/enhancers'

describe('tokenEnhancer', () => {
  const token = {query: {ab: 'cd'}}
  
  it('should set the token query as the query string', () => {
    const options = { token }
    
    const options2 = tokenEnhancer.options(options)
    
    expect(options2).to.have.property('qs')
      .and.deep.equal(options.token.query)
  })
  
  it('should add the token query to the query string if it already exists', () => {
    const options = { token, qs: {ef: 'gh'} }
    
    const options2 = tokenEnhancer.options(options)
    
    expect(options2).to.have.property('qs')
      .and.deep.equal({...options.token.query, ...options.qs})
  })
  
  it('should do nothing if no token is provided', () => {
    const options = {}
    
    const options2 = tokenEnhancer.options(options)
    
    expect(options2).to.equal(options)
  })
})