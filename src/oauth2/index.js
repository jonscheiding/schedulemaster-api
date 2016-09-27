import bodyParser from 'body-parser'
import express from 'express'

import { passport } from 'config'
import oauth2orize from './oauth2orize'

const api = express.Router()
api.use(bodyParser.urlencoded({extended: false}))

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