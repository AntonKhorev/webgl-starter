'use strict';

const Lines=require('./lines.js');

class Feature {
	constructor() {
		this.features=[];
	}
	// methods to be redefined
	hasInputs() {
		return this.features.some(feature=>feature.hasInputs());
	}
	requestFeatureContext(featureContext) {
		this.features.forEach(feature=>{
			feature.requestFeatureContext(featureContext);
		});
	}
	getHtmlInputLines(i18n) {
		const lines=new Lines;
		this.features.forEach(feature=>{
			lines.a(feature.getHtmlInputLines(i18n));
		});
		return lines;
	}
	getJsInitLines(featureContext) {
		const lines=new Lines;
		this.features.forEach(feature=>{
			lines.a(feature.getJsInitLines(featureContext));
		});
		return lines;
	}
	getJsLoopLines() {
		const lines=new Lines;
		this.features.forEach(feature=>{
			lines.a(feature.getJsLoopLines());
		});
		return lines;
	}
}

module.exports=Feature;
