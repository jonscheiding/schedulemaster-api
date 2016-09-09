import express from 'express'
import { makeConverter } from 'json-mapper'

import { createPage, createForm, formEnhancer } from 'scraper'
import { checkboxValue }  from 'scraper/utils'

const api = express.Router()
export default api

const getPartOfForm = part => (req, res) => 
  res.promise(page(req.token).get()
    .then(r => r.form.data[part]))
    
const patchPartOfForm = part => (req, res) => 
  res.promise(page(req.token).get()
    .then(r => r.form.submit({[part]: req.body}))
    .then(r => {
      if(r.error) {
        res.status(400)
        return {message: r.error.toString()}
      }
      return r.form.data[part]
    }))

const convertFromForm = makeConverter({
  name: {
    'lastName': 'tx_lastname',
    'firstName': 'tx_firstname',
    'middleInitial': 'tx_mi',
  },
  contact: {
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
  'tx_cellphone': 'contact.phoneNumbers.mobile',
  'tx_hmphone': 'contact.phoneNumbers.home',
  'tx_wrkphone': 'contact.phoneNumbers.work',
  'tx_fax': 'contact.phoneNumbers.fax',
  'tx_email': 'contact.emails.primary.address',
  'ck_terse1': [ 'contact.emails.primary.terse', checkboxValue() ],
  'tx_email2': 'contact.emails.secondary.address',
  'ck_terse2': [ 'contact.emails.secondary.terse', checkboxValue() ],
  'tx_street': 'address.street1',
  'tx_street2': 'address.street2',
  'tx_city': 'address.city',
  'tx_state': 'address.state',
  'tx_zip': 'address.zip',
  'ddl_country' : 'address.country',
})

const form = createForm(convertFromForm, convertToForm)
const page = createPage('https://my.schedulemaster.com/UserInfo.aspx?GETUSER=M', {
  form: formEnhancer(form),
  error: $ => $('.yMessage').text()
})

api.get('/user', (req, res) => {
  res.send({
    username: req.token.username,
    links: {
      address: '/user/address',
      contact: '/user/contact',
      name: '/user/name'
    }
  })
})

api.get('/user/name', getPartOfForm('name'))
api.get('/user/address', getPartOfForm('address'))
api.get('/user/contact', getPartOfForm('contact'))
api.patch('/user/name', patchPartOfForm('name'))
api.patch('/user/address', patchPartOfForm('address'))
api.patch('/user/contact', patchPartOfForm('contact'))
