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
      
    return loginPage.login('username', 'password')
      .catch(() => {})
      .then(() => n.done())
  })
  
  it('should resolve with a token if the location header indicates successful login', () => {
    const n = nock('https://my.schedulemaster.com')
      .post('/login.asp')
      .reply(301, '', {'Location': '/wherever?userid=12345&session=67890'})
      
    return loginPage.login('username', 'password')
      .then(result => {
        expect(result).to.have.property('userid', '12345')
        expect(result).to.have.property('session', '67890')
        
        n.done()
      })
  })
})