'use strict'

const Lines=require('crnx-base/lines')
const NumericFeature=require('./numeric-feature')

class IntFeature extends NumericFeature {
	constructor(name,value) {
		super()
		this.name=name
		this.value=value
	}
	hasInputs() {
		return super.hasInputs() || this.value.input!='constant'
	}
	requestFeatureContext(featureContext) {
		super.requestFeatureContext(featureContext)
		if (this.value.input!='constant') {
			featureContext.hasInputs=true
		}
		if (this.value.input=='slider') {
			featureContext.hasSliders=true
		}
	}
	getHtmlControlMessageLines(i18n) {
		const a=Lines.ba(super.getHtmlControlMessageLines(i18n))
		a(this.getHtmlControlMessageForValue(i18n,this.value,this.name))
		return a.e()
	}
	getHtmlInputLines(i18n) {
		const a=Lines.ba(super.getHtmlInputLines(i18n))
		const v=this.value
		if (v.input=='slider') {
			a(
				"<div>",
				Lines.html`	<label for=${this.name}>${i18n('options.'+this.name)}:</label>`,
				"	<span class=min>"+i18n('options.'+this.name+'.value',v.min)+"</span>", // html inserted, no escaping
				Lines.html`	<input type=range id=${this.name} min=${v.min} max=${v.max} value=${v} />`,
				"	<span class=max>"+i18n('options.'+this.name+'.value',v.max)+"</span>",
				"</div>"
			)
		}
		return a.e()
	}
}

module.exports=IntFeature
