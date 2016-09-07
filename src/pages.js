import { createScraper } from 'scraper'

const getRealInputName = inputName => inputName.substring(inputName.lastIndexOf('$') + 1)

export const userInfo = 
  createScraper(
    'https://my.schedulemaster.com/UserInfo.aspx?GETUSER=M', 
    promise => promise
      .then(({$}) => {
        const data = {}
        
        $('table.UserTables input, textarea, select').each((i, input) => {
          const value = $(input).attr('type') == 'checkbox'
            ? $(input).is(':checked')
            : $(input).val()
          
          data[getRealInputName($(input).attr('name'))] = value || null
        })
        
        return {
          _data: data,
          name: {
            lastName: data['tx_lastname'],
            firstName: data['tx_firstname'],
            middleInitial: data['tx_mi']
          },
          phoneNumbers: {
            mobile: data['tx_cellphone'],
            home: data['tx_hmphone'],
            work: data['tx_wrkphone'],
            fax: data['tx_fax']
          },
          emails: {
            primary: {
              address: data['tx_email'],
              terse: data['ck_terse1']
            },
            secondary: {
              address: data['tx_email2'],
              terse: data['ck_terse2']
            }
          },
          address: {
            street1: data['tx_street'],
            street2: data['tx_street2'],
            city: data['tx_city'],
            state: data['tx_state'],
            zip: data['tx_zip'],
            country: data['ddl_country']
          }
        }
      })
    )