import { createScraper } from 'scraper'
import { parseForm } from 'page-utils'
import JM from 'json-mapper'

const userConverter = JM.makeConverter({
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
    'country': 'ddl_country'
  }
})

export const userInfo = 
  createScraper(
    'https://my.schedulemaster.com/UserInfo.aspx?GETUSER=M', 
    promise => promise
      .then(({$}) => {
        const data = parseForm($('table.UserTables'))
        return userConverter(data)
      })
    )