import express from 'express'
import bodyParser from 'body-parser'
import bearerToken from 'express-bearer-token'

import api from 'api'

const app = express()
app.use(bodyParser.json())
app.use(bearerToken())
app.use(api)
app.listen(3000)
