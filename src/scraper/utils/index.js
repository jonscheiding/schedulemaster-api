import url from 'url'

const isSuccessStatusCode = statusCode => statusCode >= 200 && statusCode < 300

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
  addQueryToUrl
}

