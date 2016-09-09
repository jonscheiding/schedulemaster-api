import express from 'express'

import { formMiddleware } from 'scraper'
import { userInfoPage as page } from 'pages'

const api = express.Router()
export default api

api.get('/user', (req, res) => {
  res.send({
    username: req.token.username,
    links: {
      address: '/user/address',
      contact: '/user/contact',
      name: '/user/name'
    }
  })
})

api.use('/user/name', formMiddleware(page, 'name'))
api.use('/user/address', formMiddleware(page, 'address'))
api.use('/user/contact', formMiddleware(page, 'contact'))

