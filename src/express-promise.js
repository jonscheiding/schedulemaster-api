const resolved = res => result => {
  if(result) res.send(result)
}

const rejected = res => err => {
  res.status(500)
  res.send({error: err.toString()})
}

export default () => (req, res, next) => {
  let promise
  res.promise = (p) => promise = p
  
  next()
  
  if(promise) {
    promise.then(resolved(res)).catch(rejected(res))
  }
}