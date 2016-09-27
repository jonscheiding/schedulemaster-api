import bodyParser from 'body-parser'
import express from 'express'

import { passport } from 'config'
import oauth2orize from './oauth2orize'

const api = express.Router()
api.use(bodyParser.urlencoded({extended: false}))

api.use('/authorize',
  (req, res, next) => {
    req.user = {
      credentials: { username: 'test', password: 'test' }
    }
    next()
  },
  //
  // TODO: Validate the client ID I guess
  //
  oauth2orize.authorization((clientId, redirectUri, done) => done(null, clientId, redirectUri)),
  oauth2orize.decision((req, done) => done(null, { scope: [req.query.scope] }))
)

api.use('/token',
  passport.authenticateClient(),
  oauth2orize.token(), 
  oauth2orize.errorHandler()
)

api.get('/check',
  passport.authenticateToken(),
  (req, res) => res.send(req.user)
)

export default api