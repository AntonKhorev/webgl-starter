'use strict';

const fixOptHelp=require('./fixed-options-helpers.js');
const Lines=require('./lines.js');
const Vector=require('./vector.js');

class CallVector extends Vector {
	constructor(name,values,calledFn,calledFnDefaultArgs) {
		super(name,values);
		this.calledFn=calledFn;
		this.calledFnDefaultArgs=calledFnDefaultArgs;
	}
	// private:
	writeJsInitStartLines() {
		if (this.nSliders>0 || this.values.every((v,c,i)=>v==this.calledFnDefaultArgs[i])) {
			return new Lines;
		}
		return new Lines(
			this.calledFn+"("+this.values.map(fixOptHelp.formatNumber).join(",")+");"
		);
	}
	writeJsUpdateFnLines() {
		const updateFnLines=new Lines;
		if (this.nSliders<=1) {
			updateFnLines.a(
				this.calledFn+"("+this.values.map(this.componentValue,this).join(",")+");"
			);
		} else if (this.nSliders==this.values.length) {
			let obj=this.calledFn;
			const dotIndex=obj.lastIndexOf('.');
			if (dotIndex>=0) {
				obj=obj.slice(0,dotIndex);
			}
			updateFnLines.a(
				this.calledFn+".apply("+obj+",["+this.values.map((v,c)=>"'"+c+"'").join(",")+"].map(function(c){",
				"	return parseFloat(document.getElementById('"+this.name+".'+c).value);",
				"}));"
			);
		} else {
			updateFnLines.a(
				this.calledFn+"("
			);
			this.values.forEach((v,c,i)=>{
				if (i>0) {
					updateFnLines.t(",");
				}
				updateFnLines.a(
					"	"+this.componentValue(v,c)
				);
			});
			updateFnLines.a(
				");"
			);
		}
		return updateFnLines;
	}
	addPostToListenerEntryAfterComponents(entry) {
		if (this.nSliders==0) {
			entry.post(
				this.calledFn+"("+this.values.map(this.componentValue,this).join(",")+");"
			);
		} else {
			entry.post(this.updateFnName()+"();");
		}
	}
}

module.exports=CallVector;
