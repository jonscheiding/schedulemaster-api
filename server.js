import express from 'express'
import request from 'request'
import base64 from 'base-64'
import bodyParser from 'body-parser'
import bearerToken from 'express-bearer-token'

const app = express()

app.use(bodyParser.json())
app.use(bearerToken())

app.post('/token', (req, res) => {
  request(
    {
      url: 'https://my.schedulemaster.com/login.asp',
      form: {
        USERID: req.body.user,
        DATA: req.body.password,
        CMD: 'LOGIN'
      },
      followRedirect: false
    },
    (error, response) => {
      res.send({
        token: base64.encode(response.headers['set-cookie'])
      })
    }
  )
})

app.get('/test', (req, res) => {
  request(
    {
      url: 'https://my.schedulemaster.com/SCHDATA.asp?USERID=63552&SESSION=19640025&INITIAL=YES&DISPLAY=GRID1&refr=0&resrequest=&LS=365&TD=N&FR=Y',
      headers: {
        'Cookie': base64.decode(req.token)
      }
    },
    (error, response, html) => res.send(html)
  )
})

app.listen(3000)
