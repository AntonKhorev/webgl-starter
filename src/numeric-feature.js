'use strict'

const Input=require('./input-classes')
const Lines=require('crnx-base/lines')
const Feature=require('./feature')

class NumericFeature extends Feature {
	// private:
	getHtmlControlMessageForValue(i18n,value,name) {
		if (value.input instanceof Input.MouseMove) {
			return Lines.bae(
				"<li>"+i18n('controls.type.'+value.input)+" "+i18n('controls.to')+" <strong>"+i18n('options.'+name)+"</strong></li>"
			)
		} else {
			return Lines.be()
		}
	}
}

module.exports=NumericFeature
