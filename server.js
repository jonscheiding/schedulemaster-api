import express from 'express'
import request from 'request'
import cheerio from 'cheerio'
import base64 from 'base-64'
import bodyParser from 'body-parser'
import bearerToken from 'express-bearer-token'
import url from 'url'
import encrypter from 'object-encrypter'

const enc = encrypter('secret', {ttl: false})

const app = express()

app.use(bodyParser.json())
app.use(bearerToken())

app.post('/token', (req, res) => {
  request.post(
    'https://my.schedulemaster.com/login.asp',
    {
      form: {
        USERID: req.body.user,
        DATA: req.body.password,
        CMD: 'LOGIN'
      },
      followRedirect: false
    },
    (error, response) => {
      const redirectUrl = url.parse(response.headers['location'], true)
      console.log(redirectUrl)
      const token = {
        cookie: response.headers['set-cookie'],
        userid: redirectUrl.query.userid,
        session: redirectUrl.query.session
      }
      
      res.send({ token: enc.encrypt(token) })
    }
  )
})

app.get('/user', (req, res) => {
  const token = enc.decrypt(req.token)
  request(
    {
      url: 'https://my.schedulemaster.com/UserInfo.aspx?userid=' + token.userid + '&session=' + token.session
    },
    (error, response, html) => res.send(html)
  )
})

app.listen(3000)
