import express from 'express'
import { userInfo } from 'pages'

const api = express.Router()
export default api

api.get('/user', (req, res) => {
  res.promise(userInfo(req.token).get())
})

api.put('/user', (req, res) => {
  res.promise(userInfo(req.token).post(req.body))
})
