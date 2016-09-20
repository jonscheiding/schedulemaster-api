import url from 'url'

const isSuccessStatusCode = statusCode => statusCode >= 200 && statusCode < 300
const isErrorStatusCode = statusCode => statusCode >= 400 && statusCode < 600

const checkboxValue = (value = 'on') => isChecked => isChecked ? value : null

const addQueryToUrl = (urlStr, query) => {
  const parsedUrl = url.parse(urlStr, true)
  return url.format({
    ...parsedUrl,
    query: {
      ...parsedUrl.query,
      ...query
    },
    search: undefined
  })
}

export {
  isSuccessStatusCode,
  isErrorStatusCode,
  addQueryToUrl,
  checkboxValue
}

