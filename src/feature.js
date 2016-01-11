'use strict';

const Lines=require('./lines.js');

class Feature {
	constructor() {
		this.features=[];
	}
	// methods to be redefined
	requestFeatureContext(featureContext) {
		this.features.forEach(feature=>{
			feature.requestFeatureContext(featureContext);
		});
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
