import $ from 'cheerio'
import { makeConverter } from 'json-mapper'

export const stripDownAspnetIdentifier = identifier => {
  if(!identifier) return identifier
  const lastIndex = identifier.lastIndexOf('$')
  if(lastIndex < 0) return identifier
  return identifier.substring(lastIndex + 1)
}

export const parseForm = $ => {
  const data = {}
  
  $('input, textarea, select').each((i, input) => {
    const value = $(input).attr('type') == 'checkbox'
      ? $(input).is(':checked')
      : $(input).val()
    
    const name = stripDownAspnetIdentifier($(input).attr('name'))
    
    data[name] = value || (value === false ? false : null)
  })
  
  return data
}

export const deparseForm = ($, data) => {
  const mapping = {}
  
  $('input, textarea, select').each((i, input) => {
    const name = $(input).attr('name')
    const strippedName = stripDownAspnetIdentifier(name)
    mapping[name] = [
      strippedName,
      value => {
        switch($(input).attr('type')) {
        case 'checkbox':
          return value ? $(input).val() : null
        }
        return value
      }
    ]
  })
  
  return {
    ...parseForm($),
    ...makeConverter(mapping)(data)
  }
}