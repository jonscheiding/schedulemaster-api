import cheerio from 'cheerio'
import { chai, expect } from 'test-setup'

import { FormEnhancer } from 'scraper/enhancers/form-enhancer'

describe('formEnhancer', () => {
  const someHtml = '<form><input type="text" name="input1" value="value1"></form>'
  const someOptions = {}
  
  it('should extract the input fields into a form.data object', () => {
    const $ = cheerio.load(`<form>
      <input type="text" name="input1" value="value1">
      <input type="text" name="input2" value="value2">
      <textarea name="input3">value3</textarea>
      <select name="input4">
        <option value="value4" selected="true">Value 4</option>
        <option value="notvalue4">Not Value 4</option>
      </select>
    </form>`)
    
    const result = new FormEnhancer().handle({$})

    expect(result).to.have.deep.property('form.data')
      .and.deep.equal({
        input1: 'value1',
        input2: 'value2',
        input3: 'value3',
        input4: 'value4'
      })
  })
  
  it('should include data fields for form fields that have no value', () => {
    const $ = cheerio.load(`<form>
      <input type="text" name="input1">
    </form>`)
    
    const result = new FormEnhancer().handle({$})
    
    expect(result).to.have.deep.property('form.data')
      .and.deep.equal({input1: null})
  })
  
  it('should include value for checkboxes that are checked, and null for checkboxes that are unchecked', () => {
    const $ = cheerio.load(`<form>
      <input type="checkbox" name="input1" value="on" checked>
      <input type="checkbox" name="input2" value="on">
      <input type="radio" name="input3" value="on" checked>
      <input type="radio" name="input4" value="on">
    </form>`)
    
    const result = new FormEnhancer().handle({$})
    
    expect(result).to.have.deep.property('form.data')
      .and.deep.equal({
        input1: 'on',
        input2: null,
        input3: 'on',
        input4: null
      })
  })
  
  it('should strip off ASP.NET identifier prefixes from form field names', () => {
    const $ = cheerio.load(`<form>
      <input type="text" name="ctl00$ctl11$input1" value="value1">
    </form>`)
    
    const result = new FormEnhancer().handle({$})
    
    expect(result).to.have.deep.property('form.data')
      .and.deep.equal({input1: 'value1'})
  })
  
  it('should strip out ASP.NET control fields from the result data', () => {
    const $ = cheerio.load(`<form>
      <input type="text" name="ctl00$ctl11$input1" value="value1">
      <input type="hidden" name="__VIEWSTATE" value="viewstate">
      <input type="hidden" name="__EVENTTARGET" value="eventtarget">
      <input type="hidden" name="__EVENTARGUMENT" value="eventargument">
    </form>`)

    const result = new FormEnhancer().handle({$})
    
    expect(result).to.have.deep.property('form.data')
      .and.deep.equal({input1: 'value1'})
  })
  
  it('should strip out submit button fields from the result data', () => {
    const $ = cheerio.load(`<form>
      <input type="text" name="input1" value="value1">
      <input type="submit" name="submit" value="submit">
    </form>`)   
    
    const result = new FormEnhancer().handle({$})
    
    expect(result).to.have.deep.property('form.data')
      .and.deep.equal({input1: 'value1'}) 
  })
  
  it('should use convert if provided', () => {
    const convert = chai.spy(data => data)
    const $ = cheerio.load(someHtml)
    
    new FormEnhancer({convert}).handle({$})
      
    return expect(convert).to.have.been.called.with({input1: 'value1'})
  })
  
  it('should use the return value of convert', () => {
    const convertedData = {}
    const convert = () => convertedData
    const $ = cheerio.load(someHtml)
        
    const result = new FormEnhancer({convert}).handle({$})
    
    return expect(result).to.have.deep.property('form.data').equal(convertedData)
  })
  
  it('should add a submit method to the result', () => {
    const $ = cheerio.load(someHtml)
    
    const result = new FormEnhancer().handle({$})
    
    return expect(result)
      .to.have.deep.property('form.submit')
      .and.be.a('function')
  })
  
  describe('submit()', () => {
    it('should post the provided data to the original scraper', () => {
      const scraper = {post: chai.spy()}
      const $ = cheerio.load(someHtml)
      
      const result = new FormEnhancer().handle({$}, someOptions, scraper)
      result.form.submit({input1: 'value2'})
      
      return expect(scraper.post)
        .to.have.been.called
        .with({form: {input1: 'value2'}})
    })
    
    it('should use unconvert if provided', () => {
      const unconvert = chai.spy(data => data)
      const scraper = {post: chai.spy()}
      const $ = cheerio.load(someHtml)
      
      const result = new FormEnhancer({unconvert}).handle({$}, someOptions, scraper)
      result.form.submit({input1: 'value2'})
      
      expect(unconvert).to.have.been.called
        .with({input1: 'value2'})
    })
    
    it('should convert ASP.NET field names back to their unstripped versions', () => {
      const scraper = {post: chai.spy()}
      const $ = cheerio.load('<form><input type="text" name="ctl00$ctl00$input1" value="value1"></form>')  
      
      const result = new FormEnhancer().handle({$}, someOptions, scraper)
      result.form.submit({input1: 'value2'})
      
      return expect(scraper.post)
        .to.have.been.called
        .with({form: {'ctl00$ctl00$input1': 'value2'}})
    })
    
    it('should include ASP.NET control fields when submitting the form', () => {
      const scraper = {post: chai.spy()}
      const $ = cheerio.load(`<form>
        <input type="text" name="ctl00$ctl11$input1" value="value1">
        <input type="hidden" name="__VIEWSTATE" value="viewstate">
        <input type="hidden" name="__EVENTTARGET" value="eventtarget">
        <input type="hidden" name="__EVENTARGUMENT" value="eventargument">
      </form>`)
      
      const result = new FormEnhancer().handle({$}, someOptions, scraper)
      result.form.submit({input1: 'value2'})
      
      return expect(scraper.post)
        .to.have.been.called
        .with({ form: {
          'ctl00$ctl11$input1': 'value2',
          __VIEWSTATE: 'viewstate', 
          __EVENTTARGET: 'eventtarget', 
          __EVENTARGUMENT: 'eventargument'
        } })
    })
    
    it('should return the result that the scraper returns', () => {
      const postResult = {}
      const scraper = {post: () => postResult}
      const $ = cheerio.load('<form><input type="text" name="ctl00$ctl00$input1" value="value1"></form>')      
      
      const result = new FormEnhancer().handle({$}, someOptions, scraper)
      const submitResult = result.form.submit({})
      
      expect(submitResult).to.equal(postResult)      
    })
    
    it('should include the submit field when submit is specified', () => {
      const scraper = {post: chai.spy()}
      const $ = cheerio.load(`<form>
        <input type="text" name="input1" value="value1">
        <input type="submit" name="submitbutton" value="submitme">
      </form>`)
      
      const result = new FormEnhancer().handle({$}, someOptions, scraper)
      result.form.submit({input1: 'value1'}, 'submitbutton')
      
      return expect(scraper.post).to.have.been.called.with({ form: {
        input1: 'value1',
        submitbutton: 'submitme'
      } })
    })
      
    it('should leave fields as their previous value if they aren\'t specified', () => {
      const scraper = {post: chai.spy()}
      const $ = cheerio.load(`<form>
        <input type="text" name="input1" value="value1">
        <input type="text" name="input2" value="value2">
      </form>`)
      
      const result = new FormEnhancer().handle({$}, someOptions, scraper)
      result.form.submit({input1: 'value1`'})
      
      return expect(scraper.post).to.have.been.called.with({ form: {
        input1: 'value1`',
        input2: 'value2'
      }})
    })
    
    it('should pass original options to post() if they exist', () => {
      const scraper = {post: chai.spy()}
      const $ = cheerio.load(someHtml)
      
      const result = new FormEnhancer().handle({$}, {other: 'options'}, scraper)
      result.form.submit({})
      
      return expect(scraper.post).to.have.been.called.with({ 
        form: { input1: 'value1' },
        other: 'options'
      })
    })
    
    it('should pass additional options to post() if they are provided', () => {
      const scraper = {post: chai.spy()}
      const $ = cheerio.load(someHtml)
      
      const result = new FormEnhancer().handle({$}, someOptions, scraper)
      result.form.submit({}, null, {other: 'options'})
      
      return expect(scraper.post).to.have.been.called.with({ 
        form: { input1: 'value1' },
        other: 'options'
      })      
    })
  })
})