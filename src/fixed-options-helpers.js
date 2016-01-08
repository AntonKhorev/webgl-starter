'use strict';

exports.extendCollection=function(fixedOptionGroup,Options,additionalEntriesDescription){
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
};

exports.formatNumber=function(fixedNumber){
	return String(fixedNumber);
};
