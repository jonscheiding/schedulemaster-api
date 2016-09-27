import arrayWrap from 'array-wrap'
import createEncrypter from 'object-encrypter'
import { cleanEnv, str, num } from 'envalid'
import jwt from 'jsonwebtoken'
import yup from 'yup'

import { VALID } from 'oauth2/scopes'

const yupx = {
  scope: () => yup.array().of(
    yup.string()
      .required()
      .oneOf(VALID)
  )
}

const env = cleanEnv(process.env, { 
  TOKEN_SECRET: str(),
  TOKEN_EXPIRATION: num({default: -1})
})

class Token {
  constructor(secret = env.TOKEN_SECRET, options = {}) {
    this.secret = secret
    this.encrypter = createEncrypter(secret)
    this.options = {
      schema: yup.mixed(),
      ...options,
      encryptProps: arrayWrap(options.encryptProps)
    }
    
    if(this.options.expiresIn == -1) delete this.options.expiresIn
    
    this.parse = this.parse.bind(this)
    this.stringify = this.stringify.bind(this)
  }
  
  calculateExpiration(expiresIn) {
    expiresIn = expiresIn || this.options.expiresIn
    const now = Math.floor(Date.now() / 1000)

    if(expiresIn) return { expires: now + expiresIn, expiresIn }
    return {}
  }
  
  encryptOrDecryptProps(token, op) {
    if(op != 'encrypt' && op != 'decrypt') 
      throw new Error(`Invalid argument ${op} for 'op'.`)
    
    if(!this.options.encryptProps) return token
    const transformed = {}
    
    for(let encryptProp of this.options.encryptProps) {
      if(!token.hasOwnProperty(encryptProp)) continue
      transformed[encryptProp] = this.encrypter[op](token[encryptProp])
    }
    
    return {
      ...token,
      ...transformed
    }
  }
  
  stringify(token, options = {}) {
    return this.options.schema.validate(token, {strict: true}).then(validatedToken => {
      const { expires, expiresIn } = this.calculateExpiration(options.expiresIn)
      
      validatedToken = {
        exp: expires,
        ...this.encryptOrDecryptProps(validatedToken, 'encrypt')
      }

      return {
        tokenStr: jwt.sign(validatedToken, this.secret),
        expiresIn
      }
    })
  }
  
  parse(tokenStr) {
    let verifiedToken
    try {
      verifiedToken = jwt.verify(tokenStr, this.secret)
    } catch(err) {
      return Promise.reject(err)
    }
    
    verifiedToken = this.encryptOrDecryptProps(verifiedToken, 'decrypt')
    
    return this.options.schema.validate(verifiedToken)
  }
}

class AccessToken extends Token {
  constructor(secret, options = {}) {
    const schema = yup.object().noUnknown().shape({
      username: yup.string().required(),
      scope: yupx.scope().required(),
      client: yup.string().required(),
      exp: yup.number(),
      iat: yup.number(),
      session: yup.object().required()
    })

    super(secret, {
      schema, 
      encryptProps: 'session', 
      expiresIn: Number(env.TOKEN_EXPIRATION),
      ...options
    })
  }
}

class RefreshToken extends Token { 
  constructor(secret, options = {}) {
    const schema = yup.object().noUnknown().shape({
      client: yup.string().required(),
      credentials: yup.object().required(),
      scope: yupx.scope().required()
    })
    
    super(secret, {schema, encryptProps: 'credentials', ...options})
  }
}

class AuthorizationCode extends Token {
  constructor(secret, options = {}) {
    const schema = yup.object().noUnknown().shape({
      client: yup.string().required(),
      credentials: yup.object().required(),
      scope: yupx.scope().required(),
      uri: yup.string().required()
    })
    
    super(secret, {schema, encryptProps: 'credentials', ...options})
  }
}

AccessToken.default = new AccessToken()
RefreshToken.default = new RefreshToken()
AuthorizationCode.default = new AuthorizationCode()

for(let clazz of [AccessToken, RefreshToken, AuthorizationCode]) {
  const def = new clazz()
  clazz.stringify = def.stringify
  clazz.parse = def.parse
}

export { Token, AccessToken, RefreshToken, AuthorizationCode }