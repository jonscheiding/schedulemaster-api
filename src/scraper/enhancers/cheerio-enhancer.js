import cheerio from 'cheerio'

export default {
  result: result => ({
    ...result,
    $: cheerio.load(result.html)
  })
}