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

function makeFormatNumber(contextNumber) {
	const nonnegativeLimits=(contextNumber.availableMin>=0 && contextNumber.availableMax>=0);
	// http://stackoverflow.com/a/9553423
	const intFrac=String(contextNumber.step).split(".");
	const prec=(intFrac.length>1 ? intFrac[1].length : 0);
	if (nonnegativeLimits) {
		return n=>n.toFixed(prec);
	} else {
		return n=>(n<=0 ? n<0 ? '' /* - */ : ' ' : '+')+n.toFixed(prec);
	}
}

function formatNumber(number) {
	//return String(fixedNumber);
	return makeFormatNumber(number)(number);
}

exports.extendCollection=extendCollection;
exports.makeFormatNumber=makeFormatNumber;
exports.formatNumber=formatNumber;
