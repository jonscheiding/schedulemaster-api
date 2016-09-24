import jwt from 'jsonwebtoken'
import createEncrypter from 'object-encrypter'
import yup from 'yup'

const tokenSchema = yup.object().noUnknown().shape({
  username: yup.string().required(),
  client: yup.string(),
  exp: yup.number(),
  iat: yup.number(),
  session: yup.object().required()
})

export default (secret) => {
  const encrypter = createEncrypter(secret)
  
  return {
    stringify: (token) => {
      return tokenSchema.validate(token, {strict: true}).then(validatedToken => {
        const encryptedSession = encrypter.encrypt(validatedToken.session)
        validatedToken = {
          ...validatedToken,
          session: encryptedSession
        }
        return jwt.sign(validatedToken, secret)
      })
    },
    
    parse: (tokenStr) => {
      let verifiedToken
      try {
        verifiedToken = jwt.verify(tokenStr, secret)
      } catch(err) {
        return Promise.reject(err)
      }
      const decryptedSession = encrypter.decrypt(verifiedToken.session)
      return tokenSchema.validate({
        ...verifiedToken,
        session: decryptedSession
      })
    }
  }
}