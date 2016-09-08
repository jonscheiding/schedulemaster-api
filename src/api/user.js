import express from 'express'
import { makeConverter } from 'json-mapper'
import { createPage, createForm, formEnhancer } from 'scraper'

const api = express.Router()
export default api

api.get('/user', (req, res) => {
  res.promise(page(req.token).get().then(r => r.form.data))
})

api.put('/user', (req, res) => {
  res.promise(
    page(req.token).get()
      .then(r => r.form.submit(req.body))
      .then(r => r.form.data))
})

api.get('/test', (req, res) => {
  page(req.token).get().then(p => res.send(p.$.html()))
})


const convertFromForm = makeConverter({
  name: {
    'lastName': 'tx_lastname',
    'firstName': 'tx_firstname',
    'middleInitial': 'tx_mi',
  },
  phoneNumbers: {
    'mobile': 'tx_cellphone',
    'home': 'tx_hmphone',
    'work': 'tx_wrkphone',
    'fax': 'tx_fax',
  },
  emails: {
    primary: {
      'address': 'tx_email',
      'terse': ['ck_terse1', value => value == 'on' ],
    }, 
    secondary: {
      'address': 'tx_email2',
      'terse': [ 'ck_terse2', value => value == 'on' ],
    }
  },
  address: {
    'street1': 'tx_street',
    'street2': 'tx_street2',
    'city': 'tx_city',
    'state': 'tx_state',
    'zip': 'tx_zip',
    'country': 'ddl_country',
  }
})

const convertToForm = makeConverter({
  'tx_lastname': 'name.lastName',
  'tx_firstname': 'name.firstName',
  'tx_mi': 'name.middleInitial',
  'tx_cellphone': 'phoneNumbers.mobile',
  'tx_hmphone': 'phoneNumbers.home',
  'tx_wrkphone': 'phoneNumbers.work',
  'tx_fax': 'phoneNumbers.fax',
  'tx_email': 'emails.primary.address',
  'ck_terse1': [ 'emails.primary.terse', value => value ? 'on' : null ],
  'tx_email2': 'emails.secondary.address',
  'ck_terse2': [ 'emails.secondary.terse', value => value ? 'on' : null ],
  'tx_street': 'address.street1',
  'tx_street2': 'address.street2',
  'tx_city': 'address.city',
  'tx_state': 'address.state',
  'tx_zip': 'address.zip',
  'ddl_country' : 'address.country',
})

const form = createForm(convertFromForm, convertToForm)
const page = createPage('https://my.schedulemaster.com/UserInfo.aspx?GETUSER=M', {
  form: formEnhancer(form)
})
