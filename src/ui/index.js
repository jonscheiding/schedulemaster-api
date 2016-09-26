import bodyParser from 'body-parser'
import express from 'express'
import { loginPage } from 'pages'

const ui = express.Router()
ui.use(bodyParser.urlencoded({extended: false}))

ui.get('/login', (req, res) => res.render('login'))
ui.post('/login', (req, res) => {
  const { username, password } = req.body
  loginPage.post({username, password})
    .then(result => {
      if(!result) {
        res.render('login', { username, loginFailed: true })
        return
      }
      
      res.send(result)
    })
})

export default ui