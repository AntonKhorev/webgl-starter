'use strict';

// abstract classes

class Base {
	constructor(name,_,isVisible,updateCallback,fullName) {
		this.name=name;
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
	constructor(name,data,isVisible,updateCallback,fullName,availableValues,defaultValue) {
		super(name,data,isVisible,updateCallback,fullName);
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
	export() {
		return this.value!=this.defaultValue ? this.value : null;
	}
	fix() {
		return this.value;
	}
}

class FactorInput extends Input {
	constructor(name,data,isVisible,updateCallback,fullName,availableValues,defaultValue) {
		super(name,data,isVisible,updateCallback,fullName,availableValues,defaultValue);
		this.availableValues=availableValues;
	}
}

class RangeInput extends Input {
	constructor(name,data,isVisible,updateCallback,fullName,availableRange,defaultValue) {
		super(name,data,isVisible,updateCallback,fullName,availableRange,defaultValue);
		this.availableMin=availableRange[0];
		this.availableMax=availableRange[1];
	}
}

class Collection extends Base {
	constructor(name,_,isVisible,updateCallback,fullName,entries) {
		super(name,_,isVisible,updateCallback,fullName);
		this.entries=entries;
	}
	export() {
		const data={};
		this.entries.forEach(entry=>{
			const subData=entry.export();
			if (subData!==null) data[entry.name]=subData;
		});
		return Object.keys(data).length>0 ? data : null;
	}
	fix() {
		const data={};
		this.entries.forEach(entry=>{
			data[entry.name]=entry.fix();
		});
		return data;
	}
}

// concrete classes

class Checkbox extends Input {
	constructor(name,data,isVisible,updateCallback,fullName,_,defaultValue) {
		super(name,data,isVisible,updateCallback,fullName,_,!!defaultValue);
	}
}

class Select extends FactorInput {
}

class Root extends Collection {
}

class Group extends Collection {
}

class Array extends Base {
	constructor(name,data,isVisible,updateCallback,fullName,availableTypes,availableConstructors) {
		super(name,undefined,isVisible,updateCallback,fullName);
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
	export() {
		return this.entries.map(entry=>{
			const subData=entry.export();
			if (subData!==null) {
				return {type: entry.name, value: subData};
			} else {
				return entry.name;
			}
		});
	}
	fix() {
		return this.entries.map(entry=>{
			return {type: entry.name, value: entry.fix()};
		});
	}
	addEntry(type) {
		const entry=this.availableConstructors[type]();
		this.entries.push(entry);
		this.updateCallback();
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
