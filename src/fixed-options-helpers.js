'use strict';

function makeCollection(values,names,Options) {
	class EmptyOptions extends Options {
		get entriesDescription() {
			return [];
		}
	}
	const emptyOptions=new EmptyOptions;
	const iterateOver=values.map((v,i)=>[v,names[i],i]);
	return emptyOptions.root.fixFromIterateOver(iterateOver);
}

// fixed-width number formatting - don't use it for min width
function makeFormatNumber(contextNumber) {
	const nonnegativeLimits=(contextNumber.availableMin>=0 && contextNumber.availableMax>=0);
	const lead=Math.max(
		String(Math.abs(contextNumber.availableMin)).split('.')[0].length,
		String(Math.abs(contextNumber.availableMax)).split('.')[0].length
	);
	const splitStep=String(contextNumber.step).split('.'); // http://stackoverflow.com/a/9553423
	const prec=(splitStep.length>1 ? splitStep[1].length : 0);
	const width=lead+prec+(prec>0);
	const spaces='          '; // http://stackoverflow.com/q/10073699
	const fmt=n=>(spaces+(+n).toFixed(prec)).slice(-width);
	if (nonnegativeLimits) {
		return n=>fmt(n);
	} else {
		return n=>(n<=0 ? n<0 ? '-' : ' ' : '+')+fmt(Math.abs(n));
	}
}

function formatNumber(number) {
	return makeFormatNumber(number)(number);
}

function capNumber(number,maxValue) {
	const capped=new Number(Math.min(maxValue,number));
	capped.min=number.min;
	capped.max=Math.min(maxValue,number.max);
	capped.input=number.input;
	// needed for formatting:
	capped.availableMin=number.availableMin;
	capped.availableMax=number.availableMax;
	capped.step=number.step;
	return capped;
}

exports.makeCollection=makeCollection;
exports.makeFormatNumber=makeFormatNumber;
exports.formatNumber=formatNumber;
exports.capNumber=capNumber;
