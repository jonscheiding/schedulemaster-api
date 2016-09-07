import express from 'express'
import login from './login.js'
import user from './user.js'

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

export default [ login, api ]