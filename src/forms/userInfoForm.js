import { makeConverter } from 'json-mapper'
import { createForm } from 'scraper'

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
      'terse': 'ck_terse1',
    }, 
    secondary: {
      'address': 'tx_email2',
      'terse': 'ck_terse2',
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
  'ck_terse1': 'emails.primary.terse',
  'tx_email2': 'emails.secondary.address',
  'ck_terse2': 'emails.secondary.terse',
  'tx_street': 'address.street1',
  'tx_street2': 'address.street2',
  'tx_city': 'address.city',
  'tx_state': 'address.state',
  'tx_zip': 'address.zip',
  'ddl_country' : 'address.country',
})

export default createForm(convertToForm, convertFromForm)