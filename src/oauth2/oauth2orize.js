import oauth2orize from 'oauth2orize'

import { logger } from 'logging'
import { loginPage } from 'pages'
import Tokener from 'tokener'

const server = oauth2orize.createServer()

server.serializeClient((client, done) => done(null, client))
server.deserializeClient((client, done) => done(null, client))

server.grant(oauth2orize.grant.code(
  (client, redirectUri, user, options, done) => {
    const code = Tokener.encrypt({
      client,
      uri: redirectUri,
      credentials: user.credentials,
      scope: options.scope
    })
    
    done(null, code)
  }
))

server.exchange(oauth2orize.exchange.password(
  (client, username, password, scope, done) => 
    exchangeCredentialsForToken(client, { username, password }, scope, done)
))

server.exchange(oauth2orize.exchange.refreshToken(
  (client, refreshToken, scope, done) => {
    try {
      const { credentials } = Tokener.decrypt(refreshToken)
      exchangeCredentialsForToken(client, credentials, scope, done)
    } catch(err) { 
      done(null, false, err)
      return
    }
  }
))

server.exchange(oauth2orize.exchange.code(
  (client, code, redirectUri, done) => {
    try {
      const { credentials, uri, scope } = Tokener.decrypt(code)
      if(redirectUri != uri) return done(null, false)
      
      exchangeCredentialsForToken(client, credentials, scope, done)
    } catch(err) {
      done(null, false, err)
      return
    }
  }
))

const exchangeCredentialsForToken = (client, credentials, scope, done) => {
  loginPage.post(credentials)
    .then(result => {
      if(!result) {
        done(null, false)
        return
      }
      
      const { session, credentials } = result
      
      const accessToken = { username: credentials.username, client, scope, session }

      return Tokener.stringify(accessToken).then(accessTokenStr => {
        const refreshTokenStr = Tokener.encrypt({ ts: Date.now(), credentials })
        done(null, accessTokenStr, refreshTokenStr, {expires_in: Tokener.options.expiration})
      })
    })
    .catch(error => {
      logger.error({err: error})
      done({error: error.toString()})
    })
}

export default server