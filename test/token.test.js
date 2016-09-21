import { stringify, parse } from 'token'
import { expect } from 'test-setup'

const sampleToken = { query: { userid: '12345', session: '67890' }, username: 'jscheiding' }

describe('token', () => {
  describe('parse()', () => {
    it('should return the decrypted token when passed a valid encrypted token string', () => {
      const token = sampleToken
      const result = stringify(token).then(parse)
      
      return expect(result)
        .to.eventually.deep.equal(token)
    })
    
    it('should reject when passed an invalid encrypted token string', () => {
      const result = parse('GARBAGE_TOKEN_STRING')
      
      return expect(result.log())
        .to.be.rejected
    })
  })

  describe('stringify()', () => {
    it('should return an encrypted token when the passed token is valid', () => {
      const token = sampleToken
      const result = stringify(token)
      
      return expect(result.log())
        .to.eventually.be.resolved
    })
    
    it('should fail when the passed token is missing required properties', () => {
      const token = { username: 'jscheiding' }
      const result = stringify(token)
      
      return expect(result.log())
        .to.eventually.be.rejected
    })
    
    it('should fail when the passed token has extra properties', () => {
      const token = { ...sampleToken, something: 'else' }
      const result = stringify(token)
      
      return expect(result.log())
        .to.eventually.be.rejected
    })
    
  })
})