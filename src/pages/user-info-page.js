import { createPage, createForm, formEnhancer } from 'scraper'
import { userInfoForm } from 'mappings'

const form = createForm(userInfoForm.convertFrom, userInfoForm.convertTo)
const page = createPage('https://my.schedulemaster.com/UserInfo.aspx?GETUSER=M', {
  form: formEnhancer(form),
  error: $ => $('.yMessage').text()
})

export default page