import bodyParser from 'body-parser'
import express from 'express'
import oauth2orize from 'oauth2orize'

import { loginPage } from 'pages'
import { stringify } from 'token'

const server = oauth2orize.createServer()

server.exchange(oauth2orize.exchange.password(
  (client, username, password, scope, done) => {
    loginPage.login(username, password)
      .then(result => {
        if(!result) {
          done(false)
          return
        }
        
        return stringify({
          username: username,
          query: result
        }).then(token => done(null, token))
      })
      .catch(error => done({message: error.toString()}))
  }
))

const app = express.Router()
app.use(bodyParser.urlencoded({extended: false}))

app.use(
  '/oauth2/token',
  server.token(), 
  server.errorHandler()
)

export default app