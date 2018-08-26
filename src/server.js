import enforce from 'express-sslify'

import { logger } from 'logging'
import { express, passport } from 'config'
import oauth2 from 'oauth2'
import api from 'api'
import webpack from 'style/webpack.config'

const app = express()

if(process.env.REQUIRE_SSL) {
  app.use(enforce.HTTPS())
}

app.use(passport.initialize())
app.use(webpack())

app.use('/oauth2', oauth2)
app.use('/api', api)

export const start = port => {
  app.listen(port)
  logger.info(`Server started successfully on port ${port}.`)
}
