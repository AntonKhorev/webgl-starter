'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')

class VectorComponent {
	constructor(value,vectorName,wrapRange) {
		this.value=value // value from options.fix()
		this.vectorName=vectorName
		this.wrapRange=wrapRange // if defined and components min/max == -/+ this value, use wrap() instead of clamp()
	}
	get suffix() {
		const dotIndex=this.value.name.lastIndexOf('.')
		if (dotIndex<0) {
			return this.value.name
		} else {
			return this.value.name.slice(dotIndex+1)
		}
	}
	get name() { return this.vectorName+'.'+this.suffix }
	get varName() { return camelCase(this.name) }
	get varNameLoc() { return this.varName+'Loc' }
	get varNameSpeed() { return this.varName+'Speed' }
	get varNameInput() { return this.varName+'Input' }
	get minVarName() { return camelCase('min.'+this.name) }
	get maxVarName() { return camelCase('max.'+this.name) }
	get variable() {
		return this.value.input!='constant' || this.hasSpeed()
	}
	hasSpeed() {
		return this.value.speed!=0 || this.value.speed.input!='constant'
	}
	hasInput() {
		return this.value.input!='constant' || this.value.speed.input!='constant'
	}
	hasInputClass(inputClass) {
		return this.value.input instanceof inputClass || this.value.speed.input instanceof inputClass
	}
	usesStartTime() {
		return (this.value.input=='constant' && this.value.speed!=0) && this.value.speed.input=='constant'
	}
	usesPrevTime() {
		return (this.value.input!='constant' && this.value.speed!=0) || this.value.speed.input!='constant'
	}
	get wrapReady() {
		return this.wrapRange && this.value.min==-this.wrapRange && this.value.max==+this.wrapRange
	}
	get wrapped() {
		return this.hasSpeed() && this.wrapReady && this.value.input=='slider' // need to wrap only if input with state is used
	}
	get clamped() {
		return !this.wrapped && this.value.speed.input!='constant' && !this.wrapReady
	}
	get capped() {
		return !this.wrapped && !this.clamped && this.hasSpeed() && !this.wrapReady
	}
}

module.exports=VectorComponent
