'use strict';

class Base {
	constructor(name) {
		this.name=name;
	}
}

class Input extends Base {
	constructor(name,availableValues,defaultValue) {
		super(name);
		this.availableValues=availableValues;
		if (defaultValue!==undefined) {
			this.defaultValue=defaultValue;
		} else {
			this.defaultValue=availableValues[0];
		}
	}
}

class Select extends Input {
	constructor(name,availableValues,defaultValue) {
		super(name,availableValues,defaultValue);
	}
	get inputEntries() {
		const option=this;
		return [{
			get id() {
				return option.name;
			},
			get value() {
				return option.defaultValue;
			}
		}];
	}
}

class Collection extends Base {
	constructor(name,entries) {
		super(name);
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
