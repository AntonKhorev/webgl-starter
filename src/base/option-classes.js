'use strict';

class Base {
	constructor(fullName) {
		this.fullName=fullName;
	}
}

class Input extends Base {
	constructor(fullName,availableValues,defaultValue) {
		super(fullName);
		this.availableValues=availableValues;
		if (defaultValue!==undefined) {
			this.defaultValue=defaultValue;
		} else {
			this.defaultValue=availableValues[0];
		}
	}
}

class Select extends Input {
	constructor(fullName,availableValues,defaultValue) {
		super(fullName,availableValues,defaultValue);
	}
	get inputEntries() {
		const option=this;
		return [{
			get fullName() {
				return option.fullName;
			},
			get value() {
				return option.defaultValue;
			},
			get availableValues() {
				return option.availableValues;
			},
		}];
	}
}

class Collection extends Base {
	constructor(fullName,entries) {
		super(fullName);
		this.entries=entries;
	}
}

class Root extends Collection {
}

class Group extends Collection {
}

exports.Base=Base;
exports.Input=Input;
exports.Select=Select;
exports.Collection=Collection;
exports.Root=Root;
exports.Group=Group;
