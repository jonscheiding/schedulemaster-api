import { logger } from 'logging'
import bodyParser from 'body-parser'
import bunyanMiddleware from 'bunyan-middleware'
import express from 'express'
import expressPromise from 'express-promise'
import mustacheExpress from 'mustache-express'
import path from 'path'

import api from 'api'
import ui from 'ui'

const app = express()
app.use(bodyParser.json(), bunyanMiddleware(logger), expressPromise())
app.use('/ui', ui)
app.use(api)

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', path.resolve(__dirname, 'ui/views'))

export const start = port => {
  app.listen(port)
  logger.info(`Server started successfully on port ${port}.`)
}
