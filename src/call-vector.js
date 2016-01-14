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
	getJsUpdateLines(componentValue) {
		const lines=new Lines;
		if (this.modeConstant && this.values.every((v,c,i)=>v==this.calledFnDefaultArgs[i])) {
			// equal to default values, don't do anything
		} else if (this.nSliders<=1) {
			lines.a(
				this.calledFn+"("+this.values.map(componentValue).join(",")+");"
			);
		} else if (this.nSliders==this.values.length) {
			let obj=this.calledFn;
			const dotIndex=obj.lastIndexOf('.');
			if (dotIndex>=0) {
				obj=obj.slice(0,dotIndex);
			}
			lines.a(
				this.calledFn+".apply("+obj+",["+this.values.map((v,c)=>"'"+c+"'").join(",")+"].map(function(c){",
				"	return parseFloat(document.getElementById('"+this.name+".'+c).value);",
				"}));"
			);
		} else {
			lines.a(
				this.calledFn+"("
			);
			this.values.forEach((v,c,i)=>{
				if (i>0) {
					lines.t(",");
				}
				lines.a(
					"	"+componentValue(v,c)
				);
			});
			lines.a(
				");"
			);
		}
		return lines;
	}
	addPostToListenerEntryAfterComponents(entry,componentValue) {
		if (this.nSliders==0) {
			entry.post(
				this.calledFn+"("+this.values.map(componentValue).join(",")+");"
			);
		} else {
			entry.post(this.updateFnName+"();");
		}
	}
}

module.exports=CallVector;
