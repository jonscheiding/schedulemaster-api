import express from 'express'
import request from 'request'
import url from 'url'

import { stringify, parse } from 'token'

const api = express.Router()
export default api

api.post('/login', (req, res) => {
  request.post('https://my.schedulemaster.com/login.asp', {
    followRedirect: false,
    form: {
      USERID: req.body.user,
      DATA: req.body.password,
      CMD: 'LOGIN'
    }
  },
  (err, smResponse) => {
    const redirectUrl = url.parse(smResponse.headers['location'], { parseQuery: true })
    
    if(redirectUrl.query.rd == 'loginerror') {
      res.status(401).send({
        message: 'Username or password was incorrect.'
      })
    }
    
    const token = {
      userid: redirectUrl.query.userid,
      session: redirectUrl.query.session
    }
    
    stringify(token)
      .then(tokenStr => res.send({token: tokenStr}))
      .catch(() => res.status(500).send({
        message: 'Schedule Master returned an unexpected response.'
      }))
  })
})

api.get('/checkToken', (req, res) => res.send(req.token))