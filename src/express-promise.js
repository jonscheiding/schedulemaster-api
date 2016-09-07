const resolve = res => result => {
  if(result) res.send(result)
}

const reject = res => err => {
  res.status(500).send({error: err.toString()})
}

export default () => (req, res, next) => {
  res.promise = (p) => p.then(resolve(res)).catch(reject(res))
  next()
}