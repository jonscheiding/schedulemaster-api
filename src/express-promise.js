const resolved = res => result => {
  if(result) res.send(result)
}

const rejected = res => err => {
  res.status(500)
  res.send({error: err.toString()})
}

export default () => (req, res, next) => {
  res.promise = (p) => {
    p.then(resolved(res)).catch(rejected(res))
  }
  
  next()
}