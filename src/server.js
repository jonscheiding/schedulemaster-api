import express from 'express'
import bodyParser from 'body-parser'
import { middleware as tokenMiddleware } from 'token'

import api from 'api'

const app = express()
app.use(bodyParser.json())
app.use(tokenMiddleware())
app.use(api)
app.listen(3000)
