import $ from 'cheerio'

export const stripDownAspnetIdentifier = identifier => {
  if(!identifier) return identifier
  const lastIndex = identifier.lastIndexOf('$')
  if(lastIndex < 0) return identifier
  return identifier.substring(lastIndex + 1)
}

export const parseForm = parentSelector => {
  const data = {}
  
  parentSelector.find('input, textarea, select').each((i, input) => {
    const value = $(input).attr('type') == 'checkbox'
      ? $(input).is(':checked')
      : $(input).val()
    
    const name = stripDownAspnetIdentifier($(input).attr('name'))
    
    data[name] = value || (value === false ? false : null)
  })
  
  return data
}