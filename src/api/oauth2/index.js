import bodyParser from 'body-parser'
import express from 'express'

import oauth2orize from './oauth2orize'
import { authenticateToken, authenticateClient } from './authenticate'

const api = express.Router()
api.use(bodyParser.urlencoded({extended: false}))

api.use('/oauth2/token',
  authenticateClient(),
  oauth2orize.token(), 
  oauth2orize.errorHandler()
)

api.get('/oauth2/check',
  authenticateToken(),
  (req, res) => res.send(req.token)
)

export default api
export { api, authenticateToken, authenticateClient }