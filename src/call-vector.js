'use strict';

const Lines=require('./lines.js');
const Vector=require('./vector.js');

const CallVector=function(name,values,calledFn,calledFnDefaultArgs){
	Vector.call(this,name,values);
	this.calledFn=calledFn;
	this.calledFnDefaultArgs=calledFnDefaultArgs;
};
CallVector.prototype=Object.create(Vector.prototype);
CallVector.prototype.constructor=CallVector;
// public:
CallVector.prototype.getJsInitLines=function(){
	if (this.nSliders>0 || this.values.every((v,c,i)=>v==this.calledFnDefaultArgs[i])) {
		return new Lines;
	}
	/*
	if (this.nSliders>0 || this.values.every((v,i)=>{
		return v==this.calledFnDefaultArgs[i];
	})) {
		return new Lines;
	}
	*/
	return new Lines(
		this.calledFn+"("+this.values.map(this.formatValue).join(",")+");"
	);
};
// private:
CallVector.prototype.writeJsInterfaceGlslLines=function(){
	return new Lines;
};
CallVector.prototype.writeJsInterfaceUpdateFnLines=function(){
	const updateFnLines=new Lines;
	if (this.nSliders<=1) {
		updateFnLines.a(
			//this.calledFn+"("+this.components.map(this.componentValue,this).join(",")+");"
			this.calledFn+"("+this.values.map(this.componentValue,this).join(",")+");"
		);
	//} else if (this.nSliders==this.components.length) {
	} else if (this.nSliders==this.values.length) {
		let obj=this.calledFn;
		const dotIndex=obj.lastIndexOf('.');
		if (dotIndex>=0) {
			obj=obj.slice(0,dotIndex);
		}
		updateFnLines.a(
			//this.calledFn+".apply("+obj+",["+this.components.map(c=>"'"+c+"'").join(",")+"].map(function(c){",
			this.calledFn+".apply("+obj+",["+this.values.map((v,c)=>"'"+c+"'").join(",")+"].map(function(c){",
			"	return parseFloat(document.getElementById('"+this.name+".'+c).value);",
			"}));"
		);
	} else {
		updateFnLines.a(
			this.calledFn+"("
		);
		//this.components.forEach((c,i)=>{
		this.values.forEach((v,c,i)=>{
			if (i>0) {
				updateFnLines.t(",");
			}
			updateFnLines.a(
				//"	"+this.componentValue(c,i)
				"	"+this.componentValue(v,c)
			);
		});
		updateFnLines.a(
			");"
		);
	}
	return updateFnLines;
};
CallVector.prototype.addPostToEntryForComponent=function(entry,c){
};
CallVector.prototype.addPostToEntryAfterComponents=function(entry){
	if (this.nSliders==0) {
		entry.post(
			//this.calledFn+"("+this.components.map(this.componentValue,this).join(",")+");"
			this.calledFn+"("+this.values.map(this.componentValue,this).join(",")+");"
		);
	} else {
		entry.post(this.updateFnName()+"();");
	}
};

module.exports=CallVector;
