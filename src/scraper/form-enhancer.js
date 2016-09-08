export default form => ($, page) => ({
  data: form($).data,
  submit: (data) => page.post({form: form($).prepare('btnSave', data)})
})