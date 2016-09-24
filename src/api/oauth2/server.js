import oauth2orize from 'oauth2orize'

import { loginPage } from 'pages'
import Tokener from 'tokener'

const server = oauth2orize.createServer()

server.exchange(oauth2orize.exchange.password(
  (client, username, password, scope, done) => {
    loginPage.post({username, password})
      .then(result => {
        if(!result) {
          done(false)
          return
        }
        
        return Tokener.stringify({
          username,
          client,
          session: result
        }).then(tokenStr => done(null, tokenStr))
      })
      .catch(error => done({message: error.toString()}))
  }
))

export default server