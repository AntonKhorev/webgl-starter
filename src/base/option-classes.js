'use strict';

class Base {
	constructor(id) {
		this.id=id;
	}
}

class Input extends Base {
	constructor(id,availableValues,defaultValue) {
		super(id);
		this.availableValues=availableValues;
		if (defaultValue!==undefined) {
			this.defaultValue=defaultValue;
		} else {
			this.defaultValue=availableValues[0];
		}
	}
}

class Select extends Input {
	constructor(id,availableValues,defaultValue) {
		super(id,availableValues,defaultValue);
	}
	get inputEntries() {
		const option=this;
		return [{
			get id() {
				return option.id;
			},
			get value() {
				return option.defaultValue;
			}
		}];
	}
}

class Collection extends Base {
	constructor(id,entries) {
		super(id);
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
