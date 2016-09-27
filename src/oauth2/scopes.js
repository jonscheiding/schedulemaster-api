import 'array-sugar'

export const API = 'api'
export const LOGIN = 'login'
export const ALL = [API, LOGIN]

export const VALID = [...ALL, '*']

export const isScopeNarrower = (parentScopes, scopes) => {
  for(const scope of parseScopes(scopes)) {
    if(!parentScopes.contains(scope)) {
      return false
    }
  }
  
  return scopes
}

export const parseScopes = (scopes) => {
  if(typeof(scopes) === 'string') {
    scopes = scopes.split(/[\s,]+/)
  }
  
  const parsedScopes = []
  
  for(const scope of scopes) {
    if(scope === '') continue
    if(scope === '*') {
      parsedScopes.unique.merge(ALL)
      continue
    }
    
    if(!ALL.contains(scope)) {
      throw new Error(`Invalid scope '${scope}'.`)
    }
    
    parsedScopes.unique.push(scope)
  }
  
  return parsedScopes.sort()
}
