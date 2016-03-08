'use strict'

const Lines=require('crnx-base/lines')

class Feature {
	constructor() {
		this.features=[]
	}
	// private:
	getRecursiveLines(method,args) {
		return Lines.bae(...this.features.map(feature=>feature[method](...args)))
	}
	// methods to be redefined:
	hasInputs() {
		return this.features.some(feature=>feature.hasInputs())
	}
	requestFeatureContext(featureContext) {
		this.features.forEach(feature=>{
			feature.requestFeatureContext(featureContext)
		})
	}
	getHtmlInputLines(i18n) {
		return this.getRecursiveLines('getHtmlInputLines',arguments)
	}
	getHtmlControlMessageLines(i18n) {
		return this.getRecursiveLines('getHtmlControlMessageLines',arguments)
	}
	getJsInitLines(featureContext) {
		return this.getRecursiveLines('getJsInitLines',arguments)
	}
	getJsLoopLines(featureContext) {
		return this.getRecursiveLines('getJsLoopLines',arguments)
	}
}

module.exports=Feature
