import cheerio from 'cheerio'
import { chai, expect } from 'test-setup'

import { form as formEnhancer } from 'scraper2/enhancers'

describe('formEnhancer', () => {
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
    
    const e = formEnhancer()
    const result = e.result({$})
    
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
    
    const result = formEnhancer().result({$})
    
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
    
    const result = formEnhancer().result({$})
    
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
    
    const result = formEnhancer().result({$})
    
    expect(result).to.have.deep.property('form.data')
      .and.deep.equal({input1: 'value1'})
  })
  
  it('should use convertFromForm if provided', () => {
    const convertFromForm = chai.spy(data => data)
    const $ = cheerio.load('<form><input type="text" name="input1" value="value1"></form>')
    
    formEnhancer(convertFromForm).result({$})
      
    return expect(convertFromForm).to.have.been.called.with({input1: 'value1'})
  })
  
  it('should use the return value of convertFromForm', () => {
    const convertedData = {}
    const convertFromForm = () => convertedData
    const $ = cheerio.load('<form><input type="text" name="input1" value="value1"></form>')
        
    const result = formEnhancer(convertFromForm).result({$})
    
    return expect(result).to.have.deep.property('form.data').equal(convertedData)
  })
})