'use strict';

const imports=require('./base/option-classes.js');

const RangeInput=imports.RangeInput;

class LiveInt extends RangeInput {
	get step() {
		return 1;
	}
}

class LiveFloat extends RangeInput {
	constructor(isVisible,updateCallback,fullName,availableRange,defaultValue) {
		super(isVisible,updateCallback,fullName,availableRange,defaultValue);
		this.availableSpeedMin=availableRange[2];
		this.availableSpeedMax=availableRange[3];
		this._speed$=null;
		this._addSpeed=false;
	}
	get addSpeed() {
		return this._addSpeed;
	}
	set addSpeed(addSpeed) {
		this._addSpeed=addSpeed;
		if (this._speed$) this._speed$.toggle(addSpeed);
	}
	get speed() {
		const option=this;
		return {
			get fullName() {
				return option.fullName+'.speed';
			},
			get value() {
				return 0;
			},
			get availableMin() {
				return option.availableSpeedMin;
			},
			get availableMax() {
				return option.availableSpeedMax;
			},
			get step() {
				return option.step;
			},
			get $() {
				return option._speed$;
			},
			set $($) {
				option._speed$=$;
				if (option._speed$) option._speed$.toggle(option._addSpeed);
			}
		};
	}
	get step() {
		if (this.availableMax>=100) {
			return '0.1';
		} else if (this.availableMax>=10) {
			return '0.01';
		} else {
			return '0.001';
		}
	}
}

module.exports={};
for (let c in imports) {
	module.exports[c]=imports[c];
}
module.exports.LiveInt=LiveInt;
module.exports.LiveFloat=LiveFloat;
