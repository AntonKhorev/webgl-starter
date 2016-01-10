'use strict';

const Lines=require('./lines.js');

class Feature {
	// methods to be redefined
	getJsInitLines(featureContext) {
		return new Lines;
	}
	getJsLoopLines() {
		return new Lines;
	}
}

module.exports=Feature;
