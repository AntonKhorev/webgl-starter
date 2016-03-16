'use strict'

function capNumber(number,maxValue) {
	const capped=new Number(Math.min(maxValue,number)) // TODO Number was replaced by FixedLiveNumber in option-classes
	capped.min=number.min
	capped.max=Math.min(maxValue,number.max)
	capped.input=number.input
	capped.precision=number.precision
	return capped
}

exports.capNumber=capNumber
