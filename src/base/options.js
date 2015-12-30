'use strict';

class Options {
	constructor() {
		this.updateCallback=null; // general update callback for stuff like regenerating the code
		const Option=this.optionClasses;
		const optionByFullName={};
		const optionsWithVisibilityAffectedByFullName={};
		const makeEntry=(description,fullNamePath)=>{
			const className=description[0];
			if (Option[className]===undefined) {
				throw new Error(`invalid option type '${className}'`);
			}
			const name=description[1];
			const fullName=fullNamePath+name;
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
								return makeEntry(x,fullName+'.'); // nested option
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
			const isVisible=()=>{
				for (let testName in visibilityData) {
					const value=optionByFullName[testName].value;
					if (visibilityData[testName].indexOf(value)<0) {
						return false;
					}
				}
				return true;
			};
			const updateCallback=()=>{
				if (optionsWithVisibilityAffectedByFullName[fullName]!==undefined) {
					optionsWithVisibilityAffectedByFullName[fullName].forEach(option=>{
						option.updateVisibility();
					});
				}
				if (this.updateCallback) this.updateCallback();
			};
			const ctorArgs=[null,isVisible,updateCallback,fullName,contents,defaultValue];
			const option=new (Function.prototype.bind.apply(Option[className],ctorArgs));
			optionByFullName[fullName]=option;
			for (let testName in visibilityData) {
				if (optionsWithVisibilityAffectedByFullName[testName]===undefined) {
					optionsWithVisibilityAffectedByFullName[testName]=[];
				}
				optionsWithVisibilityAffectedByFullName[testName].push(option);
			}
			return option;
		};
		this.root=new Option.Root(()=>true,()=>{},null,this.entriesDescription.map(description=>makeEntry(description,'')));
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
