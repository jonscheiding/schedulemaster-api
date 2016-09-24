import { logger } from 'logging'
import express from 'express'
import bodyParser from 'body-parser'
import expressPromise from 'express-promise'
import bunyanMiddleware from 'bunyan-middleware'

import api from 'api'

const app = express()
app.use(bodyParser.json(), bunyanMiddleware(logger), expressPromise())
app.use(api)

export const start = port => {
  app.listen(port)
  logger.info(`Server started successfully on port ${port}.`)
}
