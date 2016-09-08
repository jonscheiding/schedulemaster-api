import { makeConverter } from 'json-mapper'

const stripDownAspnetIdentifier = aspnetName => {
  if(!aspnetName) return aspnetName
  const lastIndex = aspnetName.lastIndexOf('$')
  if(lastIndex < 0) return aspnetName
  return aspnetName.substring(lastIndex + 1)
}

const convertFromFormValue = $input => {
  switch($input.attr('type')) {
    case 'checkbox':
      return $input.is('checked')
  }
  return $input.val() || null
}

const convertToFormValue = ($input, value) => {
  switch($input.attr('type')) {
    case 'checkbox':
      return value ? $input.val() : null
  }
  return value
}

const parseForm = ($, post, convertToForm, convertFromForm) => {
  const mapping = {}
  const initialData = {}
  const parsedData = {}
  const submits = {}
  
  $('input, textarea, select').each((i, input) => {
    const name = $(input).attr('name')
    if(!name) return
    
    const strippedName = stripDownAspnetIdentifier(name)
    const value = convertFromFormValue($(input))

    if($(input).attr('type') == 'submit') {
      submits[strippedName] = { [name]: value }
      return
    }

    initialData[name] = value
    if(strippedName) parsedData[strippedName] = value
    mapping[name] = [
      strippedName,
      value => convertToFormValue($(input), value)
    ]
  })
  
  const unstripFields = makeConverter(mapping)
  
  return {
    data: convertFromForm(parsedData),
    submit: (submitName, updatedData) => {
      if(submitName && !submits[submitName]) {
        throw `No such submit for ${submitName} for form.`
      }
      
      const form = {
        ...initialData,
        ...unstripFields(convertToForm(updatedData)),
        ...submits[submitName]
      }
      
      return post({form})
        .then($ => parseForm($, post, convertToForm, convertFromForm))
    }
  }
}

const createForm = (convertToForm, convertFromForm) => ({get, post}) => {
  return get().then($ => parseForm($, post, convertToForm, convertFromForm))
}

export default createForm