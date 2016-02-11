'use strict';

const Input=require('./input-classes.js');
const imports=require('crnx-base/option-classes');

const RangeInput=imports.RangeInput;
const Group=imports.Group;

class FixedLiveNumber {
	constructor(src,setToDefault) {
		if (!setToDefault) {
			this.value=src.value;
			this.min=src.min;
			this.max=src.max;
			this.input=Input.createFromString(src.input);
		} else {
			this.value=src.defaultValue
			this.min=src.availableMin;
			this.max=src.availableMax;
			this.input=Input.createFromString('constant');
		}
		// needed for formatting and to decide on clamp()/wrap():
		this.availableMin=src.availableMin;
		this.availableMax=src.availableMax;
		this.step=src.step;
	}
	valueOf() {
		return this.value;
	}
	toString() {
		return String(this.value);
	}
}

// abstract classes

class LiveNumber extends RangeInput {
	constructor(name,availableRange,defaultValue,data,fullName,isVisible,updateCallback) {
		let dataValue,dataMin,dataMax,dataInput;
		if (typeof data == 'object') {
			dataValue=data.value;
			dataMin  =data.min;
			dataMax  =data.max;
			dataInput=data.input;
		} else {
			dataValue=data;
		}
		super(name,availableRange,defaultValue,dataValue,fullName,isVisible,updateCallback);
		this._min=(dataMin!==undefined)?dataMin:this.availableMin;
		this._max=(dataMax!==undefined)?dataMax:this.availableMax;
		this._input=(dataInput!==undefined)?dataInput:'constant';
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
	exportHelper(src) {
		const data={};
		if (src.value!=src.defaultValue) data.value=src.value;
		if (src.min!=src.availableMin) data.min=src.min;
		if (src.max!=src.availableMax) data.max=src.max;
		if (src.input!='constant') data.input=src.input;
		return data;
	}
	export() {
		return this.exportHelper(this);
	}
	fix() {
		const fixed=new FixedLiveNumber(this);
		fixed.name=this.name;
		return fixed;
	}
}

// concrete classes

class LiveInt extends LiveNumber {
	get step() {
		return 1;
	}
	get availableInputTypes() {
		return ['constant','slider','mousemovex','mousemovey'];
	}
}

class CanvasLiveInt extends LiveInt {
	get availableInputTypes() {
		return ['constant','slider'];
	}
}

class LiveFloat extends LiveNumber {
	constructor(name,availableRange,defaultValue,data,fullName,isVisible,updateCallback) {
		let dataSpeedValue,dataSpeedMin,dataSpeedMax,dataSpeedInput;
		if (typeof data == 'object') {
			if (typeof data.speed == 'object') {
				dataSpeedValue=data.speed.value;
				dataSpeedMin  =data.speed.min;
				dataSpeedMax  =data.speed.max;
				dataSpeedInput=data.speed.input;
			} else {
				dataSpeedValue=data.speed;
			}
		}
		super(...arguments);
		this._speedValue=(dataSpeedValue!==undefined)?dataSpeedValue:0;
		this._speedAvailableMin=availableRange[2]; this._speedMin=(dataSpeedMin!==undefined)?dataSpeedMin:this._speedAvailableMin;
		this._speedAvailableMax=availableRange[3]; this._speedMax=(dataSpeedMax!==undefined)?dataSpeedMax:this._speedAvailableMax;
		this._speedInput=(dataSpeedInput!==undefined)?dataSpeedInput:'constant';
		this._addSpeed=!(
			this._speedValue==0 &&
			this._speedMin==this._speedAvailableMin &&
			this._speedMax==this._speedAvailableMax &&
			this._speedInput=='constant'
		);
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
	export() {
		const notGamepad=['gamepad0','gamepad1','gamepad2','gamepad3'].indexOf(this.input)<0
		const data=this.exportHelper(this);
		if (notGamepad && this.addSpeed) {
			this.shortenExportAssign(this.exportHelper(this.speed),data,'speed');
		}
		return data;
	}
	fix() {
		const fixed=super.fix();
		const notGamepad=['gamepad0','gamepad1','gamepad2','gamepad3'].indexOf(this.input)<0
		if (notGamepad && this.addSpeed) {
			fixed.speed=new FixedLiveNumber(this.speed);
		} else {
			fixed.speed=new FixedLiveNumber(this.speed,true);
		}
		return fixed;
	}
}

class LiveColor extends Group {
	constructor(name,colorComponentDefaultValues,_,data,fullName,isVisible,updateCallback) {
		const cs='rgba';
		super(name,colorComponentDefaultValues.map((defaultValue,i)=>{
			const c=cs.charAt(i);
			let subData;
			if (typeof data == 'object') subData=data[c];
			return new LiveFloat(c,[0,1,-1,+1],defaultValue,subData,fullName+'.'+c,()=>true,updateCallback);
		}),undefined,undefined,fullName,isVisible,updateCallback);
	}
}

module.exports={};
for (let c in imports) {
	module.exports[c]=imports[c];
}
module.exports.LiveNumber=LiveNumber;
module.exports.LiveInt=LiveInt;
module.exports.CanvasLiveInt=CanvasLiveInt;
module.exports.LiveFloat=LiveFloat;
module.exports.LiveColor=LiveColor;
