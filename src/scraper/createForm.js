import { makeConverter } from 'json-mapper'

const stripFieldName = aspnetName => {
  if(!aspnetName) return aspnetName
  const lastIndex = aspnetName.lastIndexOf('$')
  if(lastIndex < 0) return aspnetName
  return aspnetName.substring(lastIndex + 1)
}

const getValueFromInput = $input => {
  switch($input.attr('type')) {
    case 'checkbox':
      if($input.is(':checked')) return null
  }
  return $input.val() || null
}

const createForm = (convertFromForm, convertToForm) => ($) => {
  const mapping = {}
  const unstrippedData = {}
  const strippedData = {}
  const submits = {}

  $('input, textarea, select').each((i, input) => {
    const $input = $(input)
    const unstrippedName = $input.attr('name')
    if(!unstrippedName) return
    
    const strippedName = stripFieldName(unstrippedName)
    const value = getValueFromInput($(input))

    if($input.attr('type') == 'submit') {
      submits[strippedName] = { [unstrippedName]: value }
      return
    }

    unstrippedData[unstrippedName] = value
    if(strippedName) {
      strippedData[strippedName] = value
      mapping[unstrippedName] = strippedName
    }
  })

  const unstripFields = makeConverter(mapping)
  
  return {
    data: convertFromForm(strippedData),
    prepare: (submitName, data) => ({
      ...unstrippedData, 
      ...unstripFields(convertToForm(data)),
      ...submits[submitName]
    })
  }
}

export default createForm