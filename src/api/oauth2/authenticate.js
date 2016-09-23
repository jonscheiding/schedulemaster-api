import bearerToken from 'express-bearer-token'
import passport from 'passport'
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password'
import { BasicStrategy } from 'passport-http'

import { parse } from 'token'

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
    done(null, false)
  }
}

passport.use(new BasicStrategy(isValidClient))
passport.use(new ClientPasswordStrategy(isValidClient))

export const authenticateClient = () =>
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false })

export const authenticateToken = () => [
  bearerToken(),
  (req, res, next) => {
    if(!req.token) {
      res.status(401).send({message: 'Authentication required.'})
      return
    }
    
    parse(req.token)
      .then(parsedToken => {
        req.token = parsedToken
        next()
      })
      .catch(err => req
        .status(500)
        .send({error: err.toString()})
      )
  }
]
