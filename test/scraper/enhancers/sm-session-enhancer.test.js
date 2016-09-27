import { expect, chai } from 'test-setup'
import { smSession as smSessionEnhancer } from 'scraper/enhancers'

describe('smSessionEnhancer', () => {
  const session = {ab: 'cd'}
  
  it('should set the token session as the query string', () => {
    const options = { session }
    const next = chai.spy()
    
    smSessionEnhancer(options, next)
    
    expect(next).to.have.been.called.with({
      qs: options.session
    })
  })
  
  it('should add the token session to the query string if it already exists', () => {
    const options = { session, qs: {ef: 'gh'} }
    const next = chai.spy()
    
    smSessionEnhancer(options, next)
    
    expect(next).to.have.been.called.with({
      qs: {...options.session, ...options.qs}
    })
  })
  
  it('should do nothing if no token is provided', () => {
    const options = {}
    const next = chai.spy()
    
    smSessionEnhancer(options, next)
    
    expect(next).to.have.been.called.with(options)
  })
})