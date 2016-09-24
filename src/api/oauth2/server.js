import oauth2orize from 'oauth2orize'

import { logger } from 'logging'
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
        
        const token = {
          username,
          client,
          session: result
        }

        return Tokener.stringify(token).then(tokenStr => done(null, tokenStr))
      })
      .catch(error => done({message: error.toString()}))
  }
))

export default server