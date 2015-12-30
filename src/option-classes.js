'use strict';

const imports=require('./base/option-classes.js');

const RangeInput=imports.RangeInput;

class LiveInt extends RangeInput {
	get inputEntries() {
		const option=this;
		return [{
			get fullName() {
				return option.fullName;
			},
			get value() {
				return option.defaultValue;
			},
			get availableMin() {
				return option.availableMin;
			},
			get availableMax() {
				return option.availableMax;
			},
		}];
	}
}

module.exports={};
for (let c in imports) {
	module.exports[c]=imports[c];
}
module.exports.LiveInt=LiveInt;