import cheerio from './cheerio-enhancer'
import form from './form-enhancer'
import smSession from './sm-session-enhancer'

export { cheerio, form, smSession }

export const defaults = [
  smSession,
  cheerio
]