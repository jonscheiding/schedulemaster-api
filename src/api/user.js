import express from 'express'
import { userInfo } from 'pages'

const api = express.Router()
export default api

api.get('/user', (req, res) => {
  userInfo(req.token).then(result => {
    res.send(result)
  })
})
