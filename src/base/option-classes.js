'use strict';

class Base {
	constructor() {
		let name,contents,defaultValue,visibilityData;
		let nScalars=0;
		let nArrays=0;
		let nObjects=0;
		this.visibilityData={};
		for (let i=0;i<arguments.length;i++) {
			let arg=arguments[i];
			if (typeof arg == 'string' || typeof arg == 'number' || typeof arg == 'boolean') {
				if (nScalars==0) {
					this.name=arg;
				} else if (nScalars==1) {
					defaultValue=arg;
				} else {
					throw new Error("too many scalar arguments");
				}
				nScalars++;
			} else if (Array.isArray(arg)) {
				if (nArrays==0) {
					contents=arg;
				} else {
					throw new Error("too many array arguments");
				}
				nArrays++;
			} else if (arg instanceof Object) {
				if (nObjects==0) {
					this.visibilityData=arg;
				} else {
					throw new Error("too many array arguments");
				}
				nObjects++;
			} else {
				throw new Error("unknown argument type");
			}
		}
		this.init(contents,defaultValue);
	}
	// to be redefined
	init(contents,defaultValue) {}
}

class Value extends Base {
	init(availableValues,defaultValue) {
		this.availableValues=availableValues;
		if (defaultValue!==undefined) {
			this.defaultValue=defaultValue;
		} else {
			this.defaultValue=availableValues[0];
		}
	}
}

class Collection extends Base {
}

exports.Base=Base;
exports.Value=Value;
exports.Collection=Collection;
