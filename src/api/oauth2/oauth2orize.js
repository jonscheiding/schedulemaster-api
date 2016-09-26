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
      
      const { session, credentials } = result
      
      const accessToken = { username, client, scope, session }
      
      return Tokener.stringify(accessToken).then(accessTokenStr => {
        const refreshTokenStr = Tokener.encrypter.encrypt({ accessToken: accessTokenStr, credentials })
        done(null, accessTokenStr, refreshTokenStr, {expires_in: Tokener.options.expiration})
      })
    })
    .catch(error => done({message: error.toString()}))
}

server.exchange(oauth2orize.exchange.password(exchangeForToken))

server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  try {
    const { credentials } = Tokener.encrypter.decrypt(refreshToken)
    const { username, password } = credentials
    exchangeForToken(client, username, password, scope, done)
  } catch(err) { 
    done(null, false)
    return
  }
}))

export default server