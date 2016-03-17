'use strict'

const formatNumbers=require('crnx-base/format-numbers')
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
			const fmt=formatNumbers({ min:v.min, max:v.max },v.precision)
			const minMax=n=>i18n.numberWithUnits(n,v.unit,(a,e)=>Lines.html`<abbr title=${e}>`+a+`</abbr>`)
			a(
				"<div>",
				Lines.html`	<label for=${this.name}>${i18n('options.'+this.name)}:</label>`,
				"	<span class=min>"+minMax(fmt.min)+"</span>",
				Lines.html`	<input type=range id=${this.name} min=${v.min} max=${v.max} value=${v} />`,
				"	<span class=max>"+minMax(fmt.max)+"</span>",
				"</div>"
			)
		}
		return a.e()
	}
}

module.exports=IntFeature
