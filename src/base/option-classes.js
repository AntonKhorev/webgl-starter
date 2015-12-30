'use strict';

// abstract classes

class Base {
	constructor(isVisible,fullName) {
		this.isVisible=isVisible;
		this.fullName=fullName;
		this._$=null;
	}
	get $() {
		return this._$;
	}
	set $($) {
		this._$=$;
		if ($) $.toggle(this.isVisible());
	}
}

class Input extends Base {
	constructor(isVisible,fullName,availableValues,defaultValue) {
		super(isVisible,fullName);
		if (defaultValue!==undefined) {
			this.defaultValue=defaultValue;
		} else {
			this.defaultValue=availableValues[0];
		}
		this._value=this.defaultValue;
	}
	get value() {
		return this._value;
	}
	set value(value) {
		this._value=value;
		// TODO toggle visibility
	}
}

class FactorInput extends Input {
	constructor(isVisible,fullName,availableValues,defaultValue) {
		super(isVisible,fullName,availableValues,defaultValue);
		this.availableValues=availableValues;
	}
}

class RangeInput extends Input {
	constructor(isVisible,fullName,availableRange,defaultValue) {
		super(isVisible,fullName,availableRange,defaultValue);
		this.availableMin=availableRange[0];
		this.availableMax=availableRange[1];
	}
}

class Collection extends Base {
	constructor(isVisible,fullName,entries) {
		super(isVisible,fullName);
		this.entries=entries;
	}
}

// concrete classes

class Select extends FactorInput {
	constructor(isVisible,fullName,availableValues,defaultValue) {
		super(isVisible,fullName,availableValues,defaultValue);
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
