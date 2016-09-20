import url from 'url'

import { createPage } from 'scraper'
import { logger } from 'logging'
import { stringify } from 'token'

export default createPage(
  {
    url: 'https://my.schedulemaster.com/login.asp',
    followRedirect: false
  },
  {
    loginResult: ($, response) => {
      const username = response.request.form.USERID
      
      if(!response.headers['location']) {
        logger.error('Bad response from Schedule Master.', {response})
        return Promise.reject('Schedule Master returned an unexpected response.')
      }
      
      const redirectUrl = url.parse(response.headers['location'], { parseQuery: true })
      if(redirectUrl.query.rd == 'loginerror') {
        logger.warn('Username or password was incorrect for user "%s".', username)
        return Promise.resolve(false)
      }
      
      if(redirectUrl.pathname == 'suspended.asp') {
        logger.warn('User account "%s" is suspended.', username)
        return Promise.resolve(false)
      }

      const token = {
        username: username,
        query: {
          userid: redirectUrl.query.userid,
          session: redirectUrl.query.session
        }
      }
      
      return stringify(token)
        .catch(err => {
          logger.error('Error serializing token.', {err, redirectUrl})
          return Promise.reject(err.toString())
        })    
    }
  }
)