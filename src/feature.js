'use strict';

const Lines=require('./lines.js');

class Feature {
	// methods to be redefined
	getJsInitLines() {
		return new Lines;
	}
}

module.exports=Feature;
