//import { makeConverter } from 'json-mapper'

//import { logger } from 'logging'

const stripFieldName = aspnetName => {
  if(!aspnetName) return aspnetName
  const lastIndex = aspnetName.lastIndexOf('$')
  if(lastIndex < 0) return aspnetName
  return aspnetName.substring(lastIndex + 1)
}

const getValueFromInput = $input => {
  switch($input.attr('type')) {
    case 'checkbox':
    case 'radio':
      if(!$input.is(':checked')) return null
  }
  return $input.val() || null
}

const parseForm = $ => {
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

  //const unstripData = makeConverter(mapping)
  
  return { mapping, data: strippedData, submits }
}

const formEnhancer = (convertFromForm, convertToForm) => {
  if(!convertFromForm) convertFromForm = data => data
  if(!convertToForm) convertToForm = data => data
  
  return {
    result: (result) => {
      if(!result.$) throw 'The cheerio enhancer needs to be added before the form enhancer.'
      
      const form = parseForm(result.$)
      const data = convertFromForm(form.data)
      return {
        ...result,
        form: {
          data
        }
      }
    }
  }
}

export default formEnhancer