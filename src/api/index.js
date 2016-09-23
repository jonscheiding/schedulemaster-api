import express from 'express'
import { api as oauth2, authenticateToken } from './oauth2'

import user from './user'

const api = express.Router()
api.use(authenticateToken())
api.use([user])

api.get('/', (req, res) => {
  res.send({
    links: {
      user: '/user'
    }
  })
})

export default [ oauth2, api ]