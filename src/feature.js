'use strict';

const Lines=require('./lines.js');

class Feature {
	constructor() {
		this.features=[];
	}
	// private:
	getRecursiveLines(method,args) {
		const lines=new Lines;
		this.features.forEach(feature=>{
			lines.a(feature[method].apply(feature,args));
		});
		return lines;
	}
	// methods to be redefined:
	hasInputs() {
		return this.features.some(feature=>feature.hasInputs());
	}
	requestFeatureContext(featureContext) {
		this.features.forEach(feature=>{
			feature.requestFeatureContext(featureContext);
		});
	}
	getHtmlInputLines(i18n) {
		return this.getRecursiveLines('getHtmlInputLines',arguments);
	}
	getHtmlControlMessageLines(i18n) {
		return this.getRecursiveLines('getHtmlControlMessageLines',arguments);
	}
	getJsInitLines(featureContext) {
		return this.getRecursiveLines('getJsInitLines',arguments);
	}
	getJsLoopLines() {
		return this.getRecursiveLines('getJsLoopLines',arguments);
	}
}

module.exports=Feature;
