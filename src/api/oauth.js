import bodyParser from 'body-parser'
import express from 'express'
import oauth2orize from 'oauth2orize'
import request from 'request'
import url from 'url'

import { stringify } from 'token'
import { logger } from 'logging'

const server = oauth2orize.createServer()

server.exchange(oauth2orize.exchange.password(
  (client, username, password, scope, done) => {
    request.post('https://my.schedulemaster.com/login.asp', {
      followRedirect: false,
      form: {
        USERID: username,
        DATA: password,
        CMD: 'LOGIN'
      }
    },
    (err, smResponse) => {
      if(err) {
        done(err.toString())
        logger.error('Error requesting login.', {err})
        return
      }
      
      if(!smResponse.headers['location']) {
        done('Schedule Master returned an unexpected response.')
        logger.error('Bad response from Schedule Master.', {smResponse})
        return
      }
      
      const redirectUrl = url.parse(smResponse.headers['location'], { parseQuery: true })
      if(redirectUrl.query.rd == 'loginerror') {
        logger.warn('Username or password was incorrect for user "%s".', username)
        done(null, false)
        return
      }
      
      if(redirectUrl.pathname == 'suspended.asp') {
        logger.warn('User account "%s" is suspended.', username)
        done(null, false)
        return
      }
      
      const token = {
        username: username,
        query: {
          userid: redirectUrl.query.userid,
          session: redirectUrl.query.session
        }
      }
      
      stringify(token)
        .then(tokenStr => done(null, tokenStr))
        .catch(err => {
          done(err.toString())
          logger.error('Error serializing token.', {err, redirectUrl})
        })      
    })
  }
))

const app = express.Router()
app.use(bodyParser.urlencoded({extended: false}))

app.use(
  '/token',
  [server.token(), server.errorHandler()]
)

export default app