import oauth2orize from 'oauth2orize'

import { loginPage } from 'pages'
import Tokener from 'tokener'

const server = oauth2orize.createServer()

const exchangeForToken = (client, username, password, scope, done) => {
  loginPage.post({username, password})
    .then(result => {
      if(!result) {
        done(null, false)
        return
      }
      
      const token = { username, client, session: result }
      
      return Tokener.stringify(token).then(tokenStr => {
        const refreshTokenStr = Tokener.encrypter.encrypt({token, username, password})
        done(null, tokenStr, refreshTokenStr, {expires_in: Tokener.options.expiration})
      })
    })
    .catch(error => done({message: error.toString()}))
}

server.exchange(oauth2orize.exchange.password(exchangeForToken))

server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  try {
    const {username, password} = Tokener.encrypter.decrypt(refreshToken)
    exchangeForToken(client, username, password, scope, done)
  } catch(err) { 
    done(null, false)
    return
  }
}))

export default server