import oauth2orize from 'oauth2orize'

import { logger } from 'logging'
import { loginPage } from 'pages'
import { AccessToken, RefreshToken, AuthorizationCode } from 'tokens'

const server = oauth2orize.createServer()

server.serializeClient((client, done) => done(null, client))
server.deserializeClient((client, done) => done(null, client))

server.grant(oauth2orize.grant.code(
  (client, redirectUri, user, options, done) => {
    AuthorizationCode
      .stringify({
        client,
        uri: redirectUri,
        credentials: user.credentials,
        scope: options.scope
      })
      .then(({codeStr}) => done(null, codeStr))
      .catch(done)
  }
))

server.exchange(oauth2orize.exchange.password(
  (client, username, password, scope, done) => 
    exchangeCredentialsForToken(client, { username, password }, scope, done)
))

server.exchange(oauth2orize.exchange.refreshToken(
  (client, refreshToken, scope, done) =>
    RefreshToken
      .parse(refreshToken)
      .then(({credentials}) => 
        exchangeCredentialsForToken(client, credentials, scope, done))
      .catch(err => done(null, false, err.toString()))
))

server.exchange(oauth2orize.exchange.code(
  (client, code, redirectUri, done) => {
    AuthorizationCode.parse(code)
      .then(({ credentials, uri, scope }) => {
        if(redirectUri != uri) return done(null, false)        
        exchangeCredentialsForToken(client, credentials, scope, done)
      })
      .catch(err => done(null, false, err))
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
      const refreshToken = { credentials, scope }
      
      return Promise.all([
        AccessToken.stringify(accessToken),
        RefreshToken.stringify(refreshToken)
      ]).then(([accessToken, refreshToken]) =>
        done(null, accessToken.tokenStr, refreshToken.tokenStr, {expires_in: accessToken.expiresIn})
      )
    })
    .catch(error => {
      logger.error({err: error})
      done({error: error.toString()})
    })
}

export default server