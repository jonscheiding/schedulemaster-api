import { stringify, parse } from 'token.js'

require('chai').use(require('chai-as-promised')).should()
require('./promise-mlog')

const sampleToken = { query: { userid: '12345', session: '67890' }, username: 'jscheiding' }

describe('parse()', () => {
  it('should return the decrypted token when passed a valid encrypted token string', () => {
    const token = sampleToken
    return stringify(token).then(parse)
      .should.eventually.deep.equal(token)
  })
  
  it('should reject when passed an invalid encrypted token string', () => {
    return parse('GARBAGE_TOKEN_STRING').log()
      .should.be.rejected
  })
})

describe('stringify()', () => {
  it('should return an encrypted token when the passed token is valid', () => {
    const token = sampleToken
    
    return stringify(token).log().should.eventually.be.resolved
  })
  
  it('should fail when the passed token is missing required properties', () => {
    const token = { username: 'jscheiding' }
    
    return stringify(token).log().should.eventually.be.rejected
  })
  
  it('should fail when the passed token has extra properties', () => {
    const token = { ...sampleToken, something: 'else' }
    
    return stringify(token).log().should.eventually.be.rejected
  })
  
})