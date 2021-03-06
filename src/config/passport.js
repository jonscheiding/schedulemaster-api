import 'array-sugar'
import passport from 'passport'
import { BasicStrategy } from 'passport-http'
import BearerStrategy from 'passport-http-bearer'
import LocalStrategy from 'passport-local'
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password'

import { logger } from 'logging'
import { loginPage } from 'pages'
import { isScopeNarrower } from 'oauth2/scopes'
import { AccessToken } from 'oauth2/tokens'

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

passport.use('user', new LocalStrategy(
  (username, password, done) => {
    loginPage.post({username, password})
      .then(result => {
        if(!result) {
          return done(null, false)
        }
        
        done(null, result)
      })
      .catch(err => done(err))    
  }
))

passport.use('token', new BearerStrategy(
  (token, done) => {
    AccessToken.parse(token)  
      .then(result => done(null, result))
      .catch(err => done(null, false, err))
  }
))

const isValidClient = (username, password, done) => {
  //
  // For now, just a single hard-coded client
  //
  if(
    username == process.env.CLIENT_ID && 
    password == process.env.CLIENT_SECRET
  ) {
    done(null, username)
  } else {
    logger.warn(`Invalid client credentials for ${username}.`)
    done(null, false)
  }
}

passport.use('client-basic', new BasicStrategy(isValidClient))
passport.use('client-oauth2-body', new ClientPasswordStrategy(isValidClient))

const checkRequiredScope = (scope) => (req, res, next) => {
  if(!scope) next()
  if(!isScopeNarrower(req.user.scope, scope)) {
    return res.status(401).send({ message: 'Token is not valid for this resource.' })
  }
  
  next()
}

export default {
  authenticateClient: (options) => passport.authenticate(['client-basic', 'client-oauth2-body'], options),
  authenticateUser: (options) => passport.authenticate('user', options),
  authenticateToken: (options = {}) => {
    const { requireScope, ...otherOptions } = options
    return [
      passport.authenticate('token', { session: false, ...otherOptions } ),
      checkRequiredScope(requireScope)
    ]
  },
  initialize: () => [ passport.initialize(), passport.session() ]
}