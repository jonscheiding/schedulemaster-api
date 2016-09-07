import express from 'express'
import { userInfo } from 'pages'

const api = express.Router()
export default api

api.get('/user', (req, res) => {
  userInfo(req.token).get().then(result => res.send(result))
})

api.put('/user', (req, res) => {
  userInfo(req.token).post(req.body).then(result => res.send(result))
    .catch(console.log)
})
