import express from 'express'
import login from './login'
import oauth2 from './oauth2'

import user from './user'

const requireToken = (req, res, next) => {
  if(!req.token) {
    res.status(401).send({error: 'Authentication required.'})
    return
  }
  next()
}

const api = express.Router()
api.use(requireToken)
api.use([user])

export default [ oauth2, login, api ]