import bodyParser from 'body-parser'
import bunyanMiddleware from 'bunyan-middleware'
import express from 'express'
import expressPromise from 'express-promise'
import expressSession from 'express-session'
import mustacheExpress from 'mustache-express'
import path from 'path'

import { logger } from 'logging'

export default () => {
  const app = express()
  
  app.engine('mustache', mustacheExpress())
  app.set('view engine', 'mustache')
  app.set('views', path.resolve(__dirname, 'ui/views'))

  app.use(bodyParser.json(), bunyanMiddleware(logger), expressPromise())
  app.use(expressSession({ resave: false, saveUninitialized: true, secret: 'TODO' }))
  
  return app
}