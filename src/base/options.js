'use strict';

class Options {
	constructor() {
		const Option=this.optionClasses;
		const makeEntry=(description,idPath)=>{
			const className=description[0];
			const name=description[1];
			const ctorArgsDescription=description.slice(2);
			let contents=[];
			let defaultValue;
			let visibilityData={};
			let nScalars=0;
			let nArrays=0;
			let nObjects=0;
			for (let i=0;i<ctorArgsDescription.length;i++) {
				let arg=ctorArgsDescription[i];
				if (typeof arg == 'string' || typeof arg == 'number' || typeof arg == 'boolean') {
					if (nScalars==0) {
						defaultValue=arg;
					} else {
						throw new Error("too many scalar arguments");
					}
					nScalars++;
				} else if (Array.isArray(arg)) {
					if (nArrays==0) {
						contents=arg.map(x=>{
							if (Array.isArray(x)) {
								return makeEntry(x,idPath+name+'.'); // nested option
							} else {
								return x; // available value / value range boundary
							}
						});
					} else {
						throw new Error("too many array arguments");
					}
					nArrays++;
				} else if (arg instanceof Object) {
					if (nObjects==0) {
						visibilityData=arg;
					} else {
						throw new Error("too many array arguments");
					}
					nObjects++;
				} else {
					throw new Error("unknown argument type");
				}
			}
			const ctorArgs=[null,idPath+name,contents,defaultValue,visibilityData];
			return new (Function.prototype.bind.apply(Option[className],ctorArgs));
		};
		this.root=new Option.Root(null,this.entriesDescription.map(description=>makeEntry(description,'')));
	}
	// methods to be redefined by subclasses
	// TODO make them static?
	get optionClasses() {
		return require('./option-classes.js');
	}
	get entriesDescription() {
		return [];
	}
}

module.exports=Options;
