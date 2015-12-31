'use strict';

const imports=require('./base/option-classes.js');

const RangeInput=imports.RangeInput;
const Group=imports.Group;

class LiveNumber extends RangeInput {
	constructor(isVisible,updateCallback,fullName,availableRange,defaultValue) {
		super(isVisible,updateCallback,fullName,availableRange,defaultValue);
		this._input='constant';
		this._min=this.availableMin;
		this._max=this.availableMax;
		this._$range=null;
	}
	updateInternalVisibility() {
		if (this._$range) this._$range.toggle(this._input!='constant');
	}
	get input() {
		return this._input;
	}
	set input(input) {
		this._input=input;
		this.updateInternalVisibility();
		this.updateCallback();
	}
	get min() {
		return this._min;
	}
	set min(min) {
		this._min=min;
		this.updateCallback();
	}
	get max() {
		return this._max;
	}
	set max(max) {
		this._max=max;
		this.updateCallback();
	}
	get $range() {
		return this._$range;
	}
	set $range($range) {
		this._$range=$range;
		this.updateInternalVisibility();
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
		this._speedMin=this._speedAvailableMin=availableRange[2];
		this._speedMax=this._speedAvailableMax=availableRange[3];
		this._addSpeed=false;
		this._speed$=null;
		this._$addSpeed=null;
	}
	updateInternalVisibility() {
		super.updateInternalVisibility();
		const notGamepad=['gamepad0','gamepad1','gamepad2','gamepad3'].indexOf(this._input)<0;
		if (this._speed$) this._speed$.toggle(
			this._addSpeed && notGamepad
		);
		if (this._$addSpeed) this._$addSpeed.toggle(notGamepad);
	}
	get addSpeed() {
		return this._addSpeed;
	}
	set addSpeed(addSpeed) {
		this._addSpeed=addSpeed;
		this.updateInternalVisibility();
		this.updateCallback();
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
			get defaultValue() {
				return 0;
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
				return option._speedAvailableMin;
			},
			get availableMax() {
				return option._speedAvailableMax;
			},
			get min() {
				return option._speedMin;
			},
			set min(min) {
				option._speedMin=min;
				option.updateCallback();
			},
			get max() {
				return option._speedMax;
			},
			set max(max) {
				option._speedMax=max;
				option.updateCallback();
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
				option.updateInternalVisibility();
			}
		};
	}
	get $addSpeed() {
		return this._$addSpeed;
	}
	set $addSpeed($addSpeed) {
		this._$addSpeed=$addSpeed;
		this.updateInternalVisibility();
	}
}

class LiveColor extends Group {
	constructor(isVisible,updateCallback,fullName,colorComponentDefaultValues) {
		const cs='rgba';
		super(isVisible,updateCallback,fullName,colorComponentDefaultValues.map(
			(defaultValue,i)=>new LiveFloat(()=>true,updateCallback,fullName+'.'+cs.charAt(i),[0,1,-1,+1],defaultValue)
		));
	}
}

module.exports={};
for (let c in imports) {
	module.exports[c]=imports[c];
}
module.exports.LiveNumber=LiveNumber;
module.exports.LiveInt=LiveInt;
module.exports.LiveFloat=LiveFloat;
module.exports.LiveColor=LiveColor;
