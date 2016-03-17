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
		a(
			this.getHtmlSliderLines(
				i18n,
				this.value,
				'options.'+this.name,
				this.name,
				false
			)
		)
		return a.e()
	}
}

module.exports=IntFeature
