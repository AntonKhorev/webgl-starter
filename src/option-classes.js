'use strict';

const imports=require('./base/option-classes.js');

const RangeInput=imports.RangeInput;

class LiveNumber extends RangeInput {
	constructor(isVisible,updateCallback,fullName,availableRange,defaultValue) {
		super(isVisible,updateCallback,fullName,availableRange,defaultValue);
		this._input='constant';
	}
	get input() {
		return this._input;
	}
	set input(input) {
		this._input=input;
		this.updateCallback();
	}
}

class LiveInt extends LiveNumber {
	get step() {
		return 1;
	}
	get availableInputTypes() {
		return ['constant','slider'];
	}
}

class LiveFloat extends LiveNumber {
	constructor(isVisible,updateCallback,fullName,availableRange,defaultValue) {
		super(isVisible,updateCallback,fullName,availableRange,defaultValue);
		this._speedValue=0;
		this._speedInput='constant';
		this.availableSpeedMin=availableRange[2];
		this.availableSpeedMax=availableRange[3];
		this._speed$=null;
		this._addSpeed=false;
		this._$addSpeed=null;
	}
	updateSpeedVisibility() {
		const notGamepad=['gamepad0','gamepad1','gamepad2','gamepad3'].indexOf(this._input)<0;
		if (this._speed$) this._speed$.toggle(
			this._addSpeed && notGamepad
		);
		if (this._$addSpeed) this._$addSpeed.toggle(notGamepad);
	}
	get input() {
		return this._input;
	}
	set input(input) {
		this._input=input;
		this.updateSpeedVisibility();
		this.updateCallback();
	}
	get addSpeed() {
		return this._addSpeed;
	}
	set addSpeed(addSpeed) {
		this._addSpeed=addSpeed;
		if (this._speed$) this._speed$.toggle(addSpeed);
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
	get availableInputTypes() {
		return ['constant','slider','mousemovex','mousemovey','gamepad0','gamepad1','gamepad2','gamepad3'];
	}
	get speed() {
		const option=this;
		return {
			get fullName() {
				return option.fullName+'.speed';
			},
			get value() {
				return option._speedValue;
			},
			set value(value) {
				option._speedValue=value;
				option.updateCallback();
			},
			get input() {
				return option._speedInput;
			},
			set input(input) {
				option._speedInput=input;
				option.updateCallback();
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
			get availableInputTypes() {
				return option.availableInputTypes;
			},
			get $() {
				return option._speed$;
			},
			set $($) {
				option._speed$=$;
				option.updateSpeedVisibility();
			}
		};
	}
	get $addSpeed() {
		return this._$addSpeed;
	}
	set $addSpeed($addSpeed) {
		this._$addSpeed=$addSpeed;
		this.updateSpeedVisibility();
	}
}

module.exports={};
for (let c in imports) {
	module.exports[c]=imports[c];
}
module.exports.LiveNumber=LiveNumber;
module.exports.LiveInt=LiveInt;
module.exports.LiveFloat=LiveFloat;
