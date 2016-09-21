import express from 'express'

import { userInfoPage as page } from 'pages'

const api = express.Router()
export default api

api.get('/user', (req, res) => {
  res.send({
    data: {
      username: req.token.username,
    },
    links: {
      info: '/user/info',
      self: '/user'
    }
  })
})

api.get('/user/info', (req, res) => {
  res.promise(page(req.token).then(r => r.form.data))
})

api.post('/user/info', (req, res) => {
  res.promise(
    page(req.token)
      .then(r => r.form.submit(req.body))
      .then(r => {
        if(r.errors) {
          res.status(400)
          return {errors: r.errors}
        }
        return r.form.data
      })
  )
})

