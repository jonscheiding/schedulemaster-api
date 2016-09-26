import bodyParser from 'body-parser'
import express from 'express'
import passport from 'passport'
import LocalStrategy from 'passport-local'

import { loginPage } from 'pages'

passport.use(new LocalStrategy(
  (username, password, done) => {
    loginPage.post({username, password})
      .then(result => {
        if(!result) {
          return done(null, false)
        }
        
        done(null, result)
      })
      .catch(err => done(err))    
  }
))

const ui = express.Router()
ui.use(bodyParser.urlencoded({extended: false}))
ui.use(passport.initialize())

ui.get('/login', (req, res) => res.render('login'))

ui.post('/login', 
  (req, res, next) => {
    passport.authenticate('local', (err, user) => {
      if(err) { return next(err) }
      if(!user) {
        return res.render('login', { loginFailed: true, username: req.body.username })
      }
  
      req.user = user
      next()
    })(req, res, next)
  },
  (req, res) => {
    res.send(req.user)
  })

export default ui
