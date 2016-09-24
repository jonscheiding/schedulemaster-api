import jwt from 'jsonwebtoken'
import createEncrypter from 'object-encrypter'

import { expect, chai } from 'test-setup'

import token from 'token2'

const sampleToken = {
  username: 'user',
  client: 'client',
  session: { key: 'value' }
}

describe('Token', () => {
  const Token = token('some_secret')
  const encrypter = createEncrypter('some_secret')
  
  describe('stringify()', () => {
    it('should resolve when called with a valid token', () => {
      const result = Token.stringify(sampleToken)
      
      return expect(result).to.eventually.be.resolved
    })
    
    it('should resolve with a valid JWT', () => {
      const result = Token.stringify(sampleToken)
        .then(jwt.decode)
        
      return expect(result.log()).to.eventually.be.not.null
    })
    
    it('should include the username and client in the JWT payload', () => {
      const result = Token.stringify(sampleToken)
        .then(jwt.decode)
        
      return Promise.all([
        expect(result).to.eventually.have.property('client', 'client'),
        expect(result).to.eventually.have.property('username', 'user')
      ])
    })
    
    it('should include a string session value in the JWT payload', () => {
      const result = Token.stringify(sampleToken)
        .then(jwt.decode)
        
      return expect(result).to.eventually.have.property('session')
        .and.be.a('string')
    })
    
    it('should have encrypted the provided session', () => {
      const result = Token.stringify(sampleToken)
        .then(jwt.decode)
        .then(decodedToken => encrypter.decrypt(decodedToken.session))
        
      return expect(result).to.eventually.deep.equal(sampleToken.session)
    })
    
    it('should have signed the JWT with the provided secret', () => {
      const result = Token.stringify(sampleToken)
        .then(tokenStr => jwt.verify(tokenStr, 'some_secret'))
        
      return expect(result).to.eventually.be.not.null
    })
    
    it('should reject if an invalid token is provided', () => {
      const result = Token.stringify({ isValidToken: false })
      
      return expect(result.log()).to.eventually.be.rejected
    })
    
    it('should reject if the provided token is missing required properties', () => {
      const result = Token.stringify({ username: 'user', client: 'client' })
      
      return expect(result.log()).to.eventually.be.rejected
    })
    
    it('should reject if the provided token has extra properties', () => {
      const result = Token.stringify({ ...sampleToken, extraProperty: true })
      
      return expect(result.log()).to.eventually.be.rejected
    })
  })
  
  describe('parse()', () => {
    it('should resolve with a valid token object when given a valid token string', () => {
      const result = Token.stringify(sampleToken)
        .then(Token.parse)
        
      return expect(result).to.eventually.be.not.null
    })
    
    it('should return the correct token username and client', () => {
      const result = Token.stringify(sampleToken)
        .then(Token.parse)
        
      return Promise.all([
        expect(result).to.eventually.have.property('username', 'user'),
        expect(result).to.eventually.have.property('client', 'client')
      ])
    })
    
    it('should return the correct session', () => {
      const result = Token.stringify(sampleToken)
        .then(Token.parse)
        .then(t => t.session)
      
      return expect(result).to.eventually.deep.equal(sampleToken.session)
    })
    
    it('should reject if the token doesn\'t match the schema', () => {
      const badToken = jwt.sign({isValidToken: false}, 'some_secret')
      const result = Token.parse(badToken)
      
      return expect(result.log()).to.eventually.be.rejected
    })
    
    it('should reject if the token wasn\'t signed with the correct secret', () => {
      const badToken = jwt.sign(sampleToken, 'wrong_secret')
      const result = Token.parse(badToken)
      
      return expect(result.log()).to.eventually.be.rejected      
    })
    
    it('should reject if the token is garbage', () => {
      const badToken = 'NOT_A_VALID_TOKEN!'
      const result = Token.parse(badToken)
      
      return expect(result.log()).to.eventually.be.rejected
    })
  })
})