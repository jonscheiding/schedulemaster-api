import express from 'express'

const api = express.Router()
export default api

api.get('/user', (req, res) => res.send({}))
