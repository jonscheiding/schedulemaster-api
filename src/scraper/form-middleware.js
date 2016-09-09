import express from 'express'

const formMiddleware = (page, part) => {
  const app = express.Router()
  
  const fromForm = data => part ? data[part] : data
  const toForm = data => part ? {[part]: data} : data
  
  app.get('/', (req, res) => {
    res.promise(page(req.token).get()
      .then(r => fromForm(r.form.data)))
  })
  
  app.patch('/', (req, res) => {
    res.promise(page(req.token).get()
      .then(r => r.form.submit(toForm(req.body)))
      .then(r => {
        if(r.error) {
          res.status(400)
          return {message: r.error.toString()}
        }
        return fromForm(r.form.data)
      }))
  })
  
  return app
}

export default formMiddleware