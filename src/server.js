import { logger } from 'logging'
import express from 'express'
import bodyParser from 'body-parser'
import { middleware as tokenMiddleware } from 'token'
import expressPromise from 'express-promise'
import bunyanMiddleware from 'bunyan-middleware'

import api from 'api'

const port = process.env.port || 3000

const app = express()
app.use(bodyParser.json(), bunyanMiddleware(logger), tokenMiddleware(), expressPromise())
app.use(api)
app.listen(port)

logger.info(`Server started successfully on port ${port}.`)