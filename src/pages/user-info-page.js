import { makeConverter } from 'json-mapper'

import { checkboxValue } from 'scraper/utils'
import { createScraper } from 'scraper2'
import { form as formEnhancer } from 'scraper2/enhancers'

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

const scraper = createScraper(
  'https://my.schedulemaster.com/UserInfo.aspx?GETUSER=M',
  formEnhancer({
    convert: convertFromForm, 
    unconvert: convertToForm,
    defaultSubmitName: 'btnSave'
  }),
  {
    result: (result) => {
      const message = result.$('.yMessage').text()
      console.log('HELLO', result.$('yMessage'))
      if(!message) return result
      
      return {
        ...result,
        errors: [message]
      }
    }
  }
)

export default (token) => scraper.get({token})