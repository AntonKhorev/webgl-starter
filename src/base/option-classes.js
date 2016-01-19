'use strict';

// constructors typically called from Options class
// to call them manually, use the following args:
//	name,contents/availableValues,defaultValue,data - similar to entriesDescription()
// the rest of arguments' order is not settled, don't use them
// 	+ TODO not sure about data

// abstract classes

class Base {
	constructor(name,_1,_2,_3,fullName,isVisible,updateCallback) {
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
	constructor(name,availableValues,defaultValue,data,fullName,isVisible,updateCallback) {
		super(...arguments);
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
	constructor(name,availableValues,defaultValue,data,fullName,isVisible,updateCallback) {
		super(...arguments);
		this.availableValues=availableValues;
	}
}

class RangeInput extends Input {
	constructor(name,availableRange,defaultValue,data,fullName,isVisible,updateCallback) {
		super(...arguments);
		this.availableMin=availableRange[0];
		this.availableMax=availableRange[1];
	}
}

class Collection extends Base {
	constructor(name,entries,_1,_2,fullName,isVisible,updateCallback) {
		super(...arguments);
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
	fixFromIterateOver(iterateOver) {
		const defineFn=fn=>((callback,thisArg)=>fn.call(iterateOver,vci=>callback.apply(thisArg,vci)));
		const data={
			length: iterateOver.length,
			map: defineFn([].map),
			every: defineFn([].every),
			some: defineFn([].some),
			forEach: defineFn([].forEach),
		};
		iterateOver.forEach((vci)=>{
			data[vci[1]]=vci[0];
		});
		return data;
	}
	fix() {
		const iterateOver=this.entries.map((entry,i)=>[entry.fix(),entry.name,i]);
		return this.fixFromIterateOver(iterateOver);
	}
}

// concrete classes

class Checkbox extends Input {
	constructor(name,_,defaultValue,data,fullName,isVisible,updateCallback) {
		super(name,undefined,!!defaultValue,data,fullName,isVisible,updateCallback);
	}
}

class Select extends FactorInput {
}

class Root extends Collection {
}

class Group extends Collection {
}

class Array extends Base {
	constructor(name,availableTypes,availableConstructors,data,fullName,isVisible,updateCallback) {
		super(name,undefined,undefined,undefined,fullName,isVisible,updateCallback);
		this.availableTypes=availableTypes;
		this.availableConstructors=availableConstructors;
		this._entries=[];
		if (typeof data == 'object') {
			for (let i in data) {
				const entryTypeAndValue=data[i];
				let entryType,entryValue;
				if (typeof entryTypeAndValue == 'string') {
					entryType=entryTypeAndValue;
				} else if (typeof entryTypeAndValue == 'object') {
					entryType=entryTypeAndValue.type;
					entryValue=entryTypeAndValue.value;
				}
				if (availableConstructors[entryType]) {
					this._entries.push(availableConstructors[entryType](entryValue));
				}
			}
		}
	}
	get entries() {
		return this._entries;
	}
	set entries(entries) {
		this._entries=entries;
		this.updateCallback();
	}
	addEntry(type) {
		const entry=this.availableConstructors[type]();
		this._entries.push(entry);
		this.updateCallback();
		return entry;
	}
	export() {
		return this._entries.map(entry=>{
			const subData=entry.export();
			if (subData!==null) {
				return {type: entry.name, value: subData};
			} else {
				return entry.name;
			}
		});
	}
	fix() {
		return this._entries.map(entry=>{
			return {type: entry.name, value: entry.fix()};
		});
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
