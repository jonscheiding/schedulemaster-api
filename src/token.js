import { cleanEnv, str } from 'envalid'
import createEncrypter from 'object-encrypter'
import yup from 'yup'

const env = cleanEnv(process.env, { TOKEN_SECRET: str() })
const encrypter = createEncrypter(env.TOKEN_SECRET)

const tokenSchema = yup.object().noUnknown().shape({
  userid: yup.string().required(),
  session: yup.string().required()
})

const validate = token => tokenSchema
  .validate(token, {strict: true})
  .catch(err => Promise.reject(err.errors.join(', ')))

export const parse = tokenStr => {
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
