import { makeConverter } from 'json-mapper'

//import { logger } from 'logging'

const stripFieldName = aspnetName => {
  if(!aspnetName) return aspnetName
  
  switch(aspnetName) {
    case '__VIEWSTATE':
    case '__EVENTTARGET':
    case '__EVENTARGUMENT':
      return undefined
  }
  
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

  const unstripConverter = makeConverter(mapping)
  
  return { mapping, strippedData, submits, 
    unstripData: strippedData => ({
      ...unstrippedData,
      ...unstripConverter(strippedData)
    })
  }
}

const formEnhancer = (convertFromForm, convertToForm) => {
  if(!convertFromForm) convertFromForm = data => data
  if(!convertToForm) convertToForm = data => data
  
  return {
    result: (result, options, scraper) => {
      if(!result.$) throw 'The cheerio enhancer needs to be added before the form enhancer.'
      
      const parsedForm = parseForm(result.$)
      const data = convertFromForm(parsedForm.strippedData)
      return {
        ...result,
        form: {
          data,
          submit: (data, submitName, submitOptions) => {
            const unstrippedData = parsedForm.unstripData(convertToForm(data))
            return scraper.post({
              ...options,
              ...submitOptions,
              form: {
                ...unstrippedData,
                ...parsedForm.submits[submitName]
              }
            })
          }
        }
      }
    }
  }
}

export default formEnhancer