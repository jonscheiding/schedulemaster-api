import express from 'express'
import { passport } from 'config'

import user from './user'

const api = express.Router()
api.use(passport.authenticateToken())
api.use([user])
api.get('/', (req, res) => res.send({
  links: {
    user: '/user'
  }
}))

export default api