import express from 'express'
import { createPage, createForm } from 'scraper'

import { userInfoPage } from 'pages'
import { userInfoForm } from 'forms'

const api = express.Router()
export default api

api.get('/user', (req, res) => {
  res.promise(userInfoForm(userInfoPage(req.token)).then(form => form.data))
})

api.put('/user', (req, res) => {
  res.promise(userInfoForm(userInfoPage(req.token))
    .then(form => form.submit('btnSave', req.body))
    .then(form => form.data))
})
