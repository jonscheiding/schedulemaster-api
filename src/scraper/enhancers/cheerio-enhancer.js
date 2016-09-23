import cheerio from 'cheerio'

export default(options, next) => 
  next().then(result => ({
    ...result,
    $: cheerio.load(result.html)
  }))