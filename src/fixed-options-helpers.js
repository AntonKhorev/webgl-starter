'use strict';

function extendCollection(fixedOptionGroup,Options,additionalEntriesDescription) {
	class AdditionalOptions extends Options {
		get entriesDescription() {
			return additionalEntriesDescription;
		}
	}
	const additionalOptions=new AdditionalOptions;
	const fog=fixedOptionGroup;
	const afog=additionalOptions.fix();
	const iterateOver=fog.map((v,c,i)=>[v,c,i]).concat(afog.map((v,c,i)=>[v,c,i+fog.length]));
	return additionalOptions.root.fixFromIterateOver(iterateOver);
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
	const fmt=n=>(spaces+n.toFixed(prec)).slice(-width);
	if (nonnegativeLimits) {
		return n=>fmt(n);
	} else {
		return n=>(n<=0 ? n<0 ? '-' : ' ' : '+')+fmt(Math.abs(n));
	}
}

function formatNumber(number) {
	return makeFormatNumber(number)(number);
}

exports.extendCollection=extendCollection;
exports.makeFormatNumber=makeFormatNumber;
exports.formatNumber=formatNumber;
