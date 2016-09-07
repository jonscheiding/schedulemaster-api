const isSuccessStatusCode = statusCode => statusCode >= 200 && statusCode < 300

const addQueryToUrl = (parsedUrl, query) => (
  {
    ...parsedUrl,
    query: {
      ...parsedUrl.query,
      ...query
    },
    search: undefined
  }
)

export {
  isSuccessStatusCode,
  addQueryToUrl
}

