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
	if (!this.modeConstant || this.values.every(function(v,i){
		return v==this.calledFnDefaultArgs[i];
	},this)) {
		return new Lines;
	}
	return new Lines(
		this.calledFn+"("+this.values.map(this.formatValue).join(",")+");"
	);
};

module.exports=CallVector;
