import oauth2orize from 'oauth2orize'

import { loginPage } from 'pages'
import { stringify } from 'token'

const server = oauth2orize.createServer()

server.exchange(oauth2orize.exchange.password(
  (client, username, password, scope, done) => {
    loginPage.login(username, password)
      .then(result => {
        if(!result) {
          done(false)
          return
        }
        
        return stringify({
          username,
          client,
          query: result
        }).then(tokenStr => done(null, tokenStr))
      })
      .catch(error => done({message: error.toString()}))
  }
))

export default server