import url from 'url'

import { createScraper } from 'scraper'
import { logger } from 'logging'

const loginResult = (response, options) => {
  const username = options.form.USERID
      
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

  return Promise.resolve({
    userid: redirectUrl.query.userid,
    session: redirectUrl.query.session
  })
}


const scraper = createScraper(
  {
    url: 'https://my.schedulemaster.com/login.asp',
    followRedirect: false
  },
  (options, next) => next().then(
    result => loginResult(result.response, options))
)

export default {
  login: (username, password) => scraper.post({
    form: {
      USERID: username,
      DATA: password,
      CMD: 'LOGIN'    
    }
  })
}