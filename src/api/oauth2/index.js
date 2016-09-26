import bodyParser from 'body-parser'
import express from 'express'
import path from 'path'

import server from './server'
import { authenticateToken, authenticateClient } from './authenticate'
import { loginPage } from 'pages'

const api = express.Router()
api.use(bodyParser.urlencoded({extended: false}))

api.use('/oauth2/token',
  authenticateClient(),
  server.token(), 
  server.errorHandler()
)

api.get('/oauth2/check',
  authenticateToken(),
  (req, res) => res.send(req.token)
)

api.get('/login', (req, res) =>
  res.sendFile(path.resolve(__dirname, 'login.html')))
  
api.post('/login', (req, res) => {
  loginPage.post({username: req.body.username, password: req.body.password})
    .then(result => {
      if(!result) {
        res.redirect('/login?failed')
        return
      }
      
      res.send(result)
    })
})

export default api
export { api, authenticateToken, authenticateClient }