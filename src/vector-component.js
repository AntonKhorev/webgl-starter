'use strict';

class VectorComponent {
	constructor(value,wrapMode) {
		this.value=value;
		this.wrapMode=!!wrapMode; // if true and components min/max == their default values, use wrap() instead of clamp()
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
			this.wrapMode &&
			(this.value.speed!=0 || this.value.speed.input!='constant') &&
			this.value.min==this.value.availableMin && this.value.max==this.value.availableMin && // can wrap only if limits are not changed
			this.value.input=='slider' // need to wrap only if input with state is used
		);
	}
	get clamped() {
		return !this.wrapped && this.value.speed.input!='constant';
	}
}

module.exports=VectorComponent;
