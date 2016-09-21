import bodyParser from 'body-parser'
import express from 'express'
import bearerToken from 'express-bearer-token'

import server from './server'
import { parse } from 'token'

const authenticate = () => [
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

const api = express.Router()
api.use(bodyParser.urlencoded({extended: false}))

api.use('/oauth2/token',
  server.token(), 
  server.errorHandler()
)

api.get('/oauth2/check',
  authenticate(),
  (req, res) => {
    res.send(req.token)
  }
)

export default api
export { api, authenticate }