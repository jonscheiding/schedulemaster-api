import { expect, chai } from 'test-setup'
import { token as tokenEnhancer } from 'scraper/enhancers'

describe('tokenEnhancer', () => {
  const token = {query: {ab: 'cd'}}
  
  it('should set the token query as the query string', () => {
    const options = { token }
    const next = chai.spy()
    
    tokenEnhancer(options, next)
    
    expect(next).to.have.been.called.with({
      qs: options.token.session
    })
  })
  
  it('should add the token query to the query string if it already exists', () => {
    const options = { token, qs: {ef: 'gh'} }
    const next = chai.spy()
    
    tokenEnhancer(options, next)
    
    expect(next).to.have.been.called.with({
      qs: {...options.token.session, ...options.qs}
    })
  })
  
  it('should do nothing if no token is provided', () => {
    const options = {}
    const next = chai.spy()
    
    tokenEnhancer(options, next)
    
    expect(next).to.have.been.called.with(options)
  })
})