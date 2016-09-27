import oauth2orize from 'oauth2orize'

import { logger } from 'logging'
import { loginPage } from 'pages'
import { parseScopes, isScopeNarrower } from 'oauth2/scopes'
import { AccessToken, RefreshToken, AuthorizationCode } from 'oauth2/tokens'

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
      .catch(err => {
        logger.error({err}, 'Error generating authorization code.')
        done
      })
  }
))

server.exchange(oauth2orize.exchange.password(
  (client, username, password, scope, done) => 
    exchangeCredentialsForToken(client, { username, password }, scope, done)
))

server.exchange(oauth2orize.exchange.refreshToken(
  (client, refreshToken, requestedScope, done) =>
    RefreshToken
      .parse(refreshToken)
      .then(({credentials, scope}) => {

        if(!isScopeNarrower(scope, requestedScope)) {
          logger.warn(`Requested scope '${requestedScope}' is broader than refresh token scope '${scope}'.`)
          return done(null, false)
        }

        exchangeCredentialsForToken(client, credentials, scope, done)

      })
      .catch(err => {
        logger.warn({err}, 'Error parsing refresh token.')
        done(null, false)
      })
))

server.exchange(oauth2orize.exchange.code(
  (client, code, redirectUri, done) => {
    AuthorizationCode.parse(code)
      .then(({ credentials, uri, scope }) => {
        if(redirectUri != uri) return done(null, false)        
        exchangeCredentialsForToken(client, credentials, scope, done)
      })
      .catch(err => {
        logger.warn({err}, 'Error parsing authorization code.')
        done(null, false)
      })
  }
))

const exchangeCredentialsForToken = (client, credentials, scope, done) => {
  loginPage.post(credentials)
    .then(result => {
      if(!result) {
        return done(null, false)
      }
      
      const { session, credentials } = result
      scope = parseScopes(scope)
      
      const accessToken = { username: credentials.username, client, scope, session }
      const refreshToken = { credentials, scope }
      
      return Promise.all([
        AccessToken.stringify(accessToken),
        RefreshToken.stringify(refreshToken)
      ]).then(([accessToken, refreshToken]) =>
        done(null, accessToken.tokenStr, refreshToken.tokenStr, {expires_in: accessToken.expiresIn})
      )
    })
    .catch(err => {
      logger.error({err}, 'Error logging in to Schedule Master.')
      done(err)
    })
}

export default server