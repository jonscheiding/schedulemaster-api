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

const form = $ => {
  const mapping = {}
  const initialData = {}
  const parsedData = {}
  const submits = {}
  
  $('input, textarea, select').each((i, input) => {
    const name = $(input).attr('name')
    if(!name) return
    
    const strippedName = stripDownAspnetIdentifier(name)
    const value = convertFromFormValue($(input))

    initialData[name] = value
    if(strippedName) parsedData[strippedName] = value
    mapping[name] = [
      strippedName,
      value => convertToFormValue($(input), value)
    ]
  })
  
  const converter = makeConverter(mapping)
  
  return {
    data: parsedData,
    prepare: (updatedData, submitName) => ({
      ...initialData,
      ...converter(updatedData)
    })
  }
}

export default form