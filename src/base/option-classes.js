'use strict';

// abstract classes

class Base {
	constructor(fullName) {
		this.fullName=fullName;
	}
}

class Input extends Base {
	constructor(fullName,availableValues,defaultValue) {
		super(fullName);
		if (defaultValue!==undefined) {
			this.defaultValue=defaultValue;
		} else {
			this.defaultValue=availableValues[0];
		}
	}
}

class FactorInput extends Input {
	constructor(fullName,availableValues,defaultValue) {
		super(fullName,availableValues,defaultValue);
		this.availableValues=availableValues;
	}
}

class RangeInput extends Input {
	constructor(fullName,availableRange,defaultValue) {
		super(fullName,availableRange,defaultValue);
		this.availableMin=availableRange[0];
		this.availableMax=availableRange[1];
	}
}

class Collection extends Base {
	constructor(fullName,entries) {
		super(fullName);
		this.entries=entries;
	}
}

// concrete classes

class Select extends FactorInput {
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

class Root extends Collection {
}

class Group extends Collection {
}

exports.Base=Base;
exports.Input=Input;
exports.FactorInput=FactorInput;
exports.RangeInput=RangeInput;
exports.Collection=Collection;
exports.Select=Select;
exports.Root=Root;
exports.Group=Group;
