'use strict';

function capitalize(s) {
	return s.charAt(0).toUpperCase()+s.slice(1);
}
function toCamelCase(s) {
	return s.split('.').map((w,i)=>i>0?capitalize(w):w).join('');
}

class VectorComponent {
	constructor(value,vectorName,suffix,wrapMode) {
		this.value=value; // value from options.fix()
		this.vectorName=vectorName;
		this.suffix=suffix; // usually one letter
		this.wrapMode=!!wrapMode; // if true and components min/max == their default values, use wrap() instead of clamp()
	}
	get name() { return this.vectorName+'.'+this.suffix; }
	get varName() { return toCamelCase(this.name); }
	get varNameLoc() { return this.varName+'Loc'; }
	get varNameSpeed() { return this.varName+'Speed'; }
	get varNameInput() { return this.varName+'Input'; }
	get minVarName() { return toCamelCase('min.'+this.name); }
	get maxVarName() { return toCamelCase('max.'+this.name); }
	get variable() {
		return this.value.input!='constant' || this.hasSpeed();
	}
	hasSpeed() {
		return this.value.speed!=0 || this.value.speed.input!='constant';
	}
	hasInput() {
		return this.value.input!='constant' || this.value.speed.input!='constant';
	}
	hasInputClass(inputClass) {
		return this.value.input instanceof inputClass || this.value.speed.input instanceof inputClass;
	}
	usesStartTime() {
		return (this.value.input=='constant' && this.value.speed!=0) && this.value.speed.input=='constant';
	}
	usesPrevTime() {
		return (this.value.input!='constant' && this.value.speed!=0) || this.value.speed.input!='constant';
	}
	get wrapped() {
		return (
			this.wrapMode && this.hasSpeed() &&
			this.value.min==this.value.availableMin && this.value.max==this.value.availableMax && // can wrap only if limits are not changed
			this.value.min==-this.value.max && // currently can limit only by absolute value
			this.value.input=='slider' // need to wrap only if input with state is used
		);
	}
	get clamped() {
		return !this.wrapped && this.value.speed.input!='constant';
	}
}

module.exports=VectorComponent;
