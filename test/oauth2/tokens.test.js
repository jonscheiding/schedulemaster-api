import jwt from 'jsonwebtoken'
import createEncrypter from 'object-encrypter'
import yup from 'yup'

import { expect } from 'test-setup'

import { Token } from 'oauth2/tokens'

describe('Token', () => {
  const tokener = new Token('some_secret', { encryptProps: 'secret' })
  const encrypter = createEncrypter('some_secret')
  const sampleToken = {
    username: 'user',
    scope: ['scope'],
    client: 'client',
    secret: { key: 'value' }
  }
  
  describe('stringify()', () => {
    it('should resolve when called with a valid token', () => {
      const result = tokener.stringify(sampleToken)
      
      return expect(result).to.eventually.be.resolved
    })
    
    it('should resolve with a valid JWT', () => {
      const result = tokener.stringify(sampleToken)
        .then(r => r.tokenStr)
        .then(jwt.decode)
        
      return expect(result.log()).to.eventually.be.not.null
    })
    
    it('should include the expiration date if one was provided', () => {
      const result = tokener.stringify({...sampleToken, exp: 3600})
        .then(r => r.tokenStr)
        .then(jwt.decode)
        
      expect(result).to.eventually.have.property('exp', 3600)
    })
    
    it('should include the default expiration date if there is one', () => {
      const result = new Token('some_secret', {expiresIn: 3600})
        .stringify(sampleToken)
        .then(r => r.tokenStr)
        .then(jwt.decode)

      return expect(result).to.eventually.have.property('exp').and.is.a('number')
    })
    
    it('should override the default expiration with the provided one', () => {
      const result = new Token('some_secret', {expiresIn: 3600})
        .stringify({...sampleToken, exp: 999999})
        .then(r => r.tokenStr)
        .then(jwt.decode)

      expect(result).to.eventually.have.property('exp', 999999)
    })
    
    it('should return the expiration when there is one', () => {
      const now = Math.floor(Date.now() / 1000)
      const result = new Token('some_secret')
        .stringify({...sampleToken, exp: now + 1000})
        .then(r => r.expiresIn)
        
      expect(result).to.eventually.equal(1000)
    })
    
    it('should include the provided properties in the JWT payload', () => {
      const result = tokener.stringify(sampleToken)
        .then(r => r.tokenStr)
        .then(jwt.decode)
        
      return Promise.all([
        expect(result).to.eventually.have.property('client', 'client'),
        expect(result).to.eventually.have.property('username', 'user')
      ])
    })
    
    it('should encrypt any properties that are specified', () => {
      const result = tokener.stringify(sampleToken)
        .then(r => r.tokenStr)
        .then(jwt.decode)
        .then(decodedToken => encrypter.decrypt(decodedToken.secret))
        
      return expect(result).to.eventually.deep.equal(sampleToken.secret)
    })
    
    it('should have signed the JWT with the provided secret', () => {
      const result = tokener.stringify(sampleToken)
        .then(r => r.tokenStr)
        .then(tokenStr => jwt.verify(tokenStr, 'some_secret'))
        
      return expect(result).to.eventually.be.not.null
    })
    
    it('should reject if the provided token does not match the schema', () => {
      const tokener = new Token('some_secret', { 
        schema: yup.object().shape({required_property: yup.mixed().required()})
      })
      const result = tokener.stringify({ username: 'user', client: 'client' })
      
      return expect(result.log()).to.eventually.be.rejected
    })
  })
  
  describe('parse()', () => {
    it('should resolve with a valid token object when given a valid token string', () => {
      const result = tokener.stringify(sampleToken)
        .then(r => r.tokenStr)
        .then(tokener.parse)
        
      return expect(result).to.eventually.be.not.null
    })
    
    it('should return the properties in the token', () => {
      const result = tokener.stringify(sampleToken)
        .then(r => r.tokenStr)
        .then(tokener.parse)
        
      return Promise.all([
        expect(result).to.eventually.have.property('username', 'user'),
        expect(result).to.eventually.have.property('client', 'client')
      ])
    })
    
    it('should decrypt any properties that were encrypted', () => {
      const result = tokener.stringify(sampleToken)
        .then(r => r.tokenStr)
        .then(tokener.parse)
        .then(t => t.session)
      
      return expect(result).to.eventually.deep.equal(sampleToken.session)
    })
    
    it('should reject if the token doesn\'t match the schema', () => {
      const tokener = new Token('some_secret', {
        schema: yup.object().shape({ requiredProperty: yup.mixed().required() })
      })
      const badToken = jwt.sign({isValidToken: false}, 'some_secret')
      const result = tokener.parse(badToken)
      
      return expect(result.log()).to.eventually.be.rejected
    })
    
    it('should reject if the token wasn\'t signed with the correct secret', () => {
      const badToken = jwt.sign(sampleToken, 'wrong_secret')
      const result = tokener.parse(badToken)
      
      return expect(result.log()).to.eventually.be.rejected      
    })
    
    it('should reject if the token is garbage', () => {
      const badToken = 'NOT_A_VALID_TOKEN!'
      const result = tokener.parse(badToken)
      
      return expect(result.log()).to.eventually.be.rejected
    })
    
    it('should reject if the token is expired', () => {
      const badToken = {...sampleToken,
        iat: Date.now() - 100,
        exp: 10
      }
      
      const result = tokener.stringify(badToken)
        .then(tokener.parse)
        
      expect(result.log()).to.eventually.be.rejected
    })
  })
})