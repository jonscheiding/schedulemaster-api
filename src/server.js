import express from 'express'
import bodyParser from 'body-parser'
import { middleware as tokenMiddleware } from 'token'
import expressPromise from 'express-promise'

import api from 'api'

const app = express()
app.use(bodyParser.json(), tokenMiddleware(), expressPromise())
app.use(api)
app.listen(3000)
