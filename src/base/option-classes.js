'use strict';

// abstract classes

class Base {
	constructor(_,isVisible,updateCallback,fullName) {
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
	constructor(data,isVisible,updateCallback,fullName,availableValues,defaultValue) {
		super(data,isVisible,updateCallback,fullName);
		if (defaultValue!==undefined) {
			this.defaultValue=defaultValue;
		} else {
			this.defaultValue=availableValues[0];
		}
		if (data!==undefined) {
			this._value=data;
		} else {
			this._value=this.defaultValue;
		}
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
	constructor(data,isVisible,updateCallback,fullName,availableValues,defaultValue) {
		super(data,isVisible,updateCallback,fullName,availableValues,defaultValue);
		this.availableValues=availableValues;
	}
}

class RangeInput extends Input {
	constructor(data,isVisible,updateCallback,fullName,availableRange,defaultValue) {
		super(data,isVisible,updateCallback,fullName,availableRange,defaultValue);
		this.availableMin=availableRange[0];
		this.availableMax=availableRange[1];
	}
}

class Collection extends Base {
	constructor(_,isVisible,updateCallback,fullName,entries) {
		super(_,isVisible,updateCallback,fullName);
		this.entries=entries;
	}
}

// concrete classes

class Checkbox extends Input {
	constructor(data,isVisible,updateCallback,fullName,_,defaultValue) {
		super(data,isVisible,updateCallback,fullName,_,!!defaultValue);
	}
}

class Select extends FactorInput {
}

class Root extends Collection {
}

class Group extends Collection {
}

class Array extends Base {
	constructor(data,isVisible,updateCallback,fullName,availableTypes,availableConstructors) {
		super(undefined,isVisible,updateCallback,fullName);
		this.availableTypes=availableTypes;
		this.availableConstructors=availableConstructors;
		this.entries=[];
		if (typeof data == 'object') {
			for (let i in data) {
				const entryTypeAndData=data[i];
				let entryType,entryData;
				if (typeof entryTypeAndData == 'string') {
					entryType=entryTypeAndData;
				} else if (typeof entryTypeAndData == 'object') {
					entryType=entryTypeAndData.type;
					entryData=entryTypeAndData.data;
				}
				if (availableConstructors[entryType]) {
					this.entries.push(availableConstructors[entryType](entryData));
				}
			}
		}
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
