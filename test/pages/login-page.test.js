import nock from 'nock'

import { expect } from 'test-setup'

import { loginPage } from 'pages'

describe('loginPage', () => {
  it('should pass the form correctly in the request', () => {
    const n = nock('https://my.schedulemaster.com')
      .post('/login.asp', {
        USERID: 'username',
        DATA: 'password',
        CMD: 'LOGIN'
      })
      .reply(200)
      
    return loginPage.post({username: 'username', password: 'password'})
      .catch(() => {})
      .then(() => n.done())
  })
  
  it('should resolve with session info if the location header indicates successful login', () => {
    const n = nock('https://my.schedulemaster.com')
      .post('/login.asp')
      .reply(301, '', {'Location': '/wherever?userid=12345&session=67890'})
      
    return loginPage.post({username: 'username', password: 'password'})
      .then(result => {
        expect(result).to.have.property('session').and.deep.equal({userid: '12345', session: '67890'})
        expect(result).to.have.property('credentials').and.deep.equal({ username: 'username', password: 'password' })
        
        n.done()
      })
  })
})