import { logger } from 'logging'
import express from 'express'
import bodyParser from 'body-parser'
import { middleware as tokenMiddleware } from 'token'
import expressPromise from 'express-promise'
import bunyanMiddleware from 'bunyan-middleware'

import api from 'api'

const app = express()
app.use(bodyParser.json(), bunyanMiddleware(logger), tokenMiddleware(), expressPromise())
app.use(api)

export const start = port => {
  app.listen(port)
  logger.info(`Server started successfully on port ${port}.`)
}
