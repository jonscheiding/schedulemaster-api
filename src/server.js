import { logger } from 'logging'
import { express, passport } from 'config'
import oauth2 from 'oauth2'
import api from 'api'
import webpack from 'style/webpack.config'

const app = express()
app.use(passport.initialize())
app.use(webpack())

app.use('/oauth2', oauth2)
app.use('/api', api)

export const start = port => {
  app.listen(port)
  logger.info(`Server started successfully on port ${port}.`)
}
