'use strict'

// fixed-width number formatting - don't use it for min width
function makeFormatNumber(contextNumber) {
	const nonnegativeLimits=(contextNumber.availableMin>=0 && contextNumber.availableMax>=0)
	const lead=Math.max(
		String(Math.abs(contextNumber.availableMin)).split('.')[0].length,
		String(Math.abs(contextNumber.availableMax)).split('.')[0].length
	)
	const prec=contextNumber.precision
	const width=lead+prec+(prec>0)
	const spaces='          ' // http://stackoverflow.com/q/10073699
	const fmt=n=>(spaces+(+n).toFixed(prec)).slice(-width)
	if (nonnegativeLimits) {
		return n=>fmt(n)
	} else {
		return n=>(n<=0 ? n<0 ? '-' : ' ' : '+')+fmt(Math.abs(n))
	}
}

function formatNumber(number) {
	return makeFormatNumber(number)(number)
}

function capNumber(number,maxValue) {
	const capped=new Number(Math.min(maxValue,number)) // TODO Number was replaced by FixedLiveNumber in option-classes
	capped.min=number.min
	capped.max=Math.min(maxValue,number.max)
	capped.input=number.input
	// needed for formatting:
	capped.availableMin=number.availableMin
	capped.availableMax=number.availableMax
	capped.precision=number.precision
	return capped
}

exports.makeFormatNumber=makeFormatNumber
exports.formatNumber=formatNumber
exports.capNumber=capNumber
