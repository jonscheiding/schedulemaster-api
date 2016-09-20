import bodyParser from 'body-parser'
import express from 'express'
import oauth2orize from 'oauth2orize'

import { loginPage } from 'pages'

const server = oauth2orize.createServer()

server.exchange(oauth2orize.exchange.password(
  (client, username, password, scope, done) => {
    loginPage(null)
      .post({
        form: {
          USERID: username,
          DATA: password,
          CMD: 'LOGIN'
        }
      }).then(r => r
        .loginResult()
        .catch(() => console.log(arguments))
        .then(token => {
          console.log(token)
          done(null, token)
        })
      ).catch(error => done({message: error}))
  }
))

const app = express.Router()
app.use(bodyParser.urlencoded({extended: false}))

app.use(
  '/token',
  server.token(), 
  server.errorHandler()
)

export default app