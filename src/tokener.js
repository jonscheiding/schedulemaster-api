import { cleanEnv, str } from 'envalid'
import jwt from 'jsonwebtoken'
import createEncrypter from 'object-encrypter'
import yup from 'yup'

const env = cleanEnv(process.env, { TOKEN_SECRET: str() })

const tokenSchema = yup.object().noUnknown().shape({
  username: yup.string().required(),
  client: yup.string(),
  exp: yup.number(),
  iat: yup.number(),
  session: yup.object().required()
})

class Tokener {
  constructor(secret) {
    this.secret = secret
    this.encrypter = createEncrypter(secret)
    
    //
    // These are necessary otherwise this can change depending on how the methods
    // are called
    //
    for(let method of ['stringify', 'parse']) {
      this[method] = this[method].bind(this)
    }
  }
  
  stringify(token) {
    return tokenSchema.validate(token, {strict: true}).then(validatedToken => {
      const encryptedSession = this.encrypter.encrypt(validatedToken.session)
      validatedToken = {
        ...validatedToken,
        session: encryptedSession
      }
      return jwt.sign(validatedToken, this.secret)
    })
  }
  
  parse(tokenStr) {
    let verifiedToken
    try {
      verifiedToken = jwt.verify(tokenStr, this.secret)
    } catch(err) {
      return Promise.reject(err)
    }
    const decryptedSession = this.encrypter.decrypt(verifiedToken.session)
    return tokenSchema.validate({
      ...verifiedToken,
      session: decryptedSession
    })
  }
  
  middleware() {
    return (req, res, next) => {
      if(!req.token) {
        res.status(401).send({message: 'Authentication required.'})
        return
      }
      
      this.parse(req.token)
        .then(parsedToken => {
          req.token = parsedToken
          next()
        })
        .catch(err => res
          .status(400)
          .send({error: err.toString()})
        )
    }
  }
}

export { Tokener }

const defaultTokener = new Tokener(env.TOKEN_SECRET)
export default defaultTokener