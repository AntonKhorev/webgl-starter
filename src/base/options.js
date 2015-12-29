'use strict';

class Options {
	constructor() {
		const Option=this.optionClasses;
		const makeEntry=description=>{
			const className=description[0];
			const ctorArgsDescription=description.slice(1);
			const ctorArgs=ctorArgsDescription.map(ctorArgDescription=>{
				if (Array.isArray(ctorArgDescription)) {
					// array arg
					return ctorArgDescription.map(x=>{
						if (Array.isArray(x)) {
							// nested option
							return makeEntry(x);
						} else {
							// available value / value range boundary
							return x;
						}
					});
				} else {
					// name / default value / scope arg - don't need to process
					return ctorArgDescription;
				}
			});
			return new (Function.prototype.bind.apply(Option[className],[null].concat(ctorArgs)));
		};
		this.root=new Option.Root(
			this.entriesDescription.map(makeEntry)
		);
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
