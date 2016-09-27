import { expect } from 'test-setup'
import { parseScopes } from 'oauth2/scopes'

describe('scopes', () => {
  describe('parseScopes()', () => {
    it('should parse a single scope into an array of one item', () => {
      const scopes1 = parseScopes('api')
      const scopes2 = parseScopes(['api'])
      
      expect(scopes1).to.deep.equal(['api'])
      expect(scopes2).to.deep.equal(['api'])
    })
    
    it('should parse multiple scopes into an array containing them all', () => {
      const scopes1 = parseScopes('api login')
      const scopes2 = parseScopes('api,login')
      const scopes3 = parseScopes('  api  ,login,')
      const scopes4 = parseScopes(['api', 'login'])
      
      expect(scopes1).to.deep.equal(['api', 'login'])
      expect(scopes2).to.deep.equal(['api', 'login'])
      expect(scopes3).to.deep.equal(['api', 'login'])
      expect(scopes4).to.deep.equal(['api', 'login'])
    })
    
    it('should include only unique scopes in the result', () => {
      const scopes1 = parseScopes('api login api')
      const scopes2 = parseScopes(['api', 'login', 'api'])
      
      expect(scopes1).to.deep.equal(['api', 'login'])
      expect(scopes2).to.deep.equal(['api', 'login'])
    })
    
    it('should sort the result', () => {
      const scopes1 = parseScopes('login api')
      const scopes2 = parseScopes(['login', 'api'])
      
      expect(scopes1).to.deep.equal(['api', 'login'])
      expect(scopes2).to.deep.equal(['api', 'login'])
    })
    
    it('should parse * as all scopes', () => {
      const scopes1 = parseScopes('*')
      const scopes2 = parseScopes(['*'])
      
      expect(scopes1).to.deep.equal(['api', 'login'])
      expect(scopes2).to.deep.equal(['api', 'login'])
    })

    it('should throw when passed invalid scopes', () => {
      const scopes1 = () => parseScopes('api login other')
      const scopes2 = () => parseScopes(['api', 'login', 'other'])
      
      expect(scopes1).to.throw()
      expect(scopes2).to.throw()
    })
  })
})