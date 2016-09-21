import express from 'express'
import { api as oauth2, authenticate } from './oauth2'

import user from './user'

const api = express.Router()
api.use(authenticate())
api.use([user])

api.get('/', (req, res) => {
  res.send({
    links: {
      user: '/user'
    }
  })
})

export default [ oauth2, api ]