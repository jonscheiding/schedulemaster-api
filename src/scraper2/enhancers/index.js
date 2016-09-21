import cheerio from './cheerio-enhancer'
import form from './form-enhancer'
import token from './token-enhancer'

export { cheerio, form, token }

export const defaults = [
  token,
  cheerio
]