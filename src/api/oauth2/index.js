import bodyParser from 'body-parser'
import express from 'express'
import path from 'path'

import server from './server'
import { authenticateToken, authenticateClient } from './authenticate'

const api = express.Router()
api.use(bodyParser.urlencoded({extended: false}))

api.use('/oauth2/token',
  authenticateClient(),
  server.token(), 
  server.errorHandler()
)

api.get('/oauth2/check',
  authenticateToken(),
  (req, res) => res.send(req.token)
)

api.get('/login', (req, res) =>
  res.sendFile(path.resolve(__dirname, 'login.html')))

export default api
export { api, authenticateToken, authenticateClient }