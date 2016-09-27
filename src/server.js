import { logger } from 'logging'
import { express, passport } from 'config'

import oauth2 from 'oauth2'
import api from 'api'

const app = express()
app.use(passport.initialize())
app.use('/oauth2', oauth2)
app.use('/api', api)

export const start = port => {
  app.listen(port)
  logger.info(`Server started successfully on port ${port}.`)
}
