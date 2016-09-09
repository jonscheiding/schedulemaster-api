import express from 'express'
import request from 'request'
import url from 'url'

import { stringify, parse } from 'token'
import { logger } from 'logging'

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
    if(err) { 
      res.status(500).send({message: err.toString()})
      logger.error('Error requesting login.', {err})
    }
    if(!smResponse.headers['location']) {
      res.status(500).send({message: 'Schedule Master returned an unexpected response.'})
      logger.error('Bad response from Schedule Master.', {smResponse})
    }
    
    const redirectUrl = url.parse(smResponse.headers['location'], { parseQuery: true })
    
    if(redirectUrl.query.rd == 'loginerror') {
      res.status(401).send({
        message: 'Username or password was incorrect.'
      })
      return
    }
    
    const token = {
      username: req.body.user,
      query: {
        userid: redirectUrl.query.userid,
        session: redirectUrl.query.session
      }
    }
    
    stringify(token)
      .then(tokenStr => res.send({token: tokenStr}))
      .catch(err => {
        res.status(500).send({ message: err.toString() })
        logger.error('Error serializing token.', {err, smResponse, token})
      })
  })
})

api.get('/checkToken', (req, res) => res.send(req.token))