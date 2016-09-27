import bodyParser from 'body-parser'
import express from 'express'
import { ensureLoggedIn } from 'connect-ensure-login'

import { passport } from 'config'
import { LOGIN } from './scopes'
import oauth2orize from './oauth2orize'

const api = express.Router()
api.use(bodyParser.urlencoded({extended: false}))

api.use('/authorize',
  ensureLoggedIn('./login'),
  //
  // TODO: Validate the client ID I guess
  //
  oauth2orize.authorization((clientId, redirectUri, done) => done(null, clientId, redirectUri)),
  oauth2orize.decision((req, done) => done(null, { scope: [req.query.scope] })),
  oauth2orize.errorHandler()
)

api.use('/token',
  passport.authenticateClient(),
  oauth2orize.token(), 
  oauth2orize.errorHandler()
)

api.get('/check',
  passport.authenticateToken({ requireScope: LOGIN }),
  (req, res) => res.send(req.user)
)

api.get('/login', (req, res) => res.render('login'))

api.post('/login',
  (req, res, next) => {
    passport.authenticateUser((err, user) => {
      if(!user) {
        return res.render('login', { loginFailed: true, ...req.body })
      }
      
      req.logIn(user, next)
    })(req, res, next)
  },
  (req, res) => res.redirect(req.session.returnTo)
)


export default api