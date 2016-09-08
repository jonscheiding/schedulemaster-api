import { cleanEnv, str } from 'envalid'
import expressBearerToken from 'express-bearer-token'
import createEncrypter from 'object-encrypter'
import yup from 'yup'

const env = cleanEnv(process.env, { TOKEN_SECRET: str() })
const encrypter = createEncrypter(env.TOKEN_SECRET)

const tokenSchema = yup.object().noUnknown().shape({
  username: yup.string().required(),
  query: yup.object().required().shape({
    userid: yup.string().required(),
    session: yup.string().required()
  })
})

const validate = token => tokenSchema
  .validate(token, {strict: true})
  .catch(err => Promise.reject(err.errors.join(', ')))

export const parse = tokenStr => {
  if(!tokenStr) return Promise.resolve(null)
  
  let token
  try {
    token = encrypter.decrypt(tokenStr)
  } catch(e) {
    return Promise.reject(e)
  }
  
  if(token == null) {
    return Promise.reject(`Failed to decrypt value ${tokenStr}.`)
  }
  
  return validate(token)
}

export const stringify = token => {
  return validate(token).then(encrypter.encrypt)
}

export const middleware = () => (req, res, next) => {
  expressBearerToken()(req, res, () => {
    parse(req.token)
      .then(parsedToken => {
        req.token = parsedToken
        next()
      })
      .catch(err => res.status(400).send({error: 'Invalid token.', detail: err.toString()}))
  })
}
