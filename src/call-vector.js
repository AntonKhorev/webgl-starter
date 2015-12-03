var Lines=require('./lines.js');
var Vector=require('./vector.js');

var CallVector=function(varName,optName,components,options,calledFn,calledFnDefaultArgs){
	Vector.call(this,varName,optName,components,options);
	this.calledFn=calledFn;
	this.calledFnDefaultArgs=calledFnDefaultArgs;
};
CallVector.prototype=Object.create(Vector.prototype);
CallVector.prototype.constructor=CallVector;
CallVector.prototype.getJsInitLines=function(){
	if (this.nSliders>0 || this.values.every(function(v,i){
		return v==this.calledFnDefaultArgs[i];
	},this)) {
		return new Lines;
	}
	return new Lines(
		this.calledFn+"("+this.values.map(this.formatValue).join(",")+");"
	);
};
CallVector.prototype.writeLocLines=function(){
	return new Lines;
};
CallVector.prototype.writeUpdateFnLines=function(){
	var updateFnLines=new Lines;
	if (this.nSliders<=1) {
		updateFnLines.a(
			this.calledFn+"("+this.components.map(this.componentValue,this).join(",")+");"
		);
	} else if (this.nSliders==this.components.length) {
		var obj=this.calledFn;
		var dotIndex=obj.lastIndexOf('.');
		if (dotIndex>=0) {
			obj=obj.slice(0,dotIndex);
		}
		updateFnLines.a(
			this.calledFn+".apply("+obj+",["+this.components.map(function(c){return "'"+c+"'"}).join(",")+"].map(function(c){",
			"	return parseFloat(document.getElementById('"+this.optName+".'+c).value);",
			"}));"
		);
	} else {
		updateFnLines.a(
			this.calledFn+"("
		);
		this.components.forEach(function(c,i){
			if (i>0) {
				updateFnLines.t(",");
			}
			updateFnLines.a(
				"	"+this.componentValue(c,i)
			);
		},this);
		updateFnLines.a(
			");"
		);
	}
	return updateFnLines;
};
CallVector.prototype.writeMousemoveEach=function(entry,c){
};
CallVector.prototype.writeMousemoveEnd=function(entry){
	if (this.nSliders==0) {
		entry.post(
			this.calledFn+"("+this.components.map(this.componentValue,this).join(",")+");"
		);
	} else {
		entry.post(this.updateFnName()+"();");
	}
};

module.exports=CallVector;
