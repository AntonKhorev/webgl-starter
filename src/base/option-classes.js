'use strict';

// abstract classes

class Base {
	constructor(isVisible,updateCallback,fullName) {
		this.isVisible=isVisible;
		this.updateCallback=updateCallback;
		this.fullName=fullName;
		this._$=null;
	}
	get $() {
		return this._$;
	}
	set $($) {
		this._$=$;
		this.updateVisibility();
	}
	updateVisibility() {
		if (this.$) this.$.toggle(this.isVisible());
	}
}

class Input extends Base {
	constructor(isVisible,updateCallback,fullName,availableValues,defaultValue) {
		super(isVisible,updateCallback,fullName);
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
		this.updateCallback();
	}
}

class FactorInput extends Input {
	constructor(isVisible,updateCallback,fullName,availableValues,defaultValue) {
		super(isVisible,updateCallback,fullName,availableValues,defaultValue);
		this.availableValues=availableValues;
	}
}

class RangeInput extends Input {
	constructor(isVisible,updateCallback,fullName,availableRange,defaultValue) {
		super(isVisible,updateCallback,fullName,availableRange,defaultValue);
		this.availableMin=availableRange[0];
		this.availableMax=availableRange[1];
	}
}

class Collection extends Base {
	constructor(isVisible,updateCallback,fullName,entries) {
		super(isVisible,updateCallback,fullName);
		this.entries=entries;
	}
}

// concrete classes

class Checkbox extends Input {
	constructor(isVisible,updateCallback,fullName,_,defaultValue) {
		super(isVisible,updateCallback,fullName,_,!!defaultValue);
	}
}

class Select extends FactorInput {
	constructor(isVisible,updateCallback,fullName,availableValues,defaultValue) {
		super(isVisible,updateCallback,fullName,availableValues,defaultValue);
	}
}

class Root extends Collection {
}

class Group extends Collection {
}

class Array extends Base {
	constructor(isVisible,updateCallback,fullName,availableTypes,availableConstructors) {
		super(isVisible,updateCallback,fullName);
		this.availableTypes=availableTypes;
		this.availableConstructors=availableConstructors;
		this.entries=[];
	}
	addEntry(type) {
		const entry=this.availableConstructors[type]();
		this.entries.push(entry);
		return entry;
	}
}

exports.Base=Base;
exports.Input=Input;
exports.Checkbox=Checkbox;
exports.FactorInput=FactorInput;
exports.RangeInput=RangeInput;
exports.Collection=Collection;
exports.Select=Select;
exports.Root=Root;
exports.Group=Group;
exports.Array=Array;
