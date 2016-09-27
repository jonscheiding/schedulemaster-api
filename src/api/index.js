import express from 'express'
import { passport } from 'config'

import { API } from 'oauth2/scopes'
import user from './user'

const api = express.Router()
api.use(passport.authenticateToken({requireScope: API}))
api.use([user])
api.get('/', (req, res) => res.send({
  links: {
    user: '/user'
  }
}))

export default api