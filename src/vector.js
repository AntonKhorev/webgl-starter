var Vector=function(varName,optName,components,options){
	this.varName=varName;
	this.optName=optName;
	this.components=components.split('');
	this.values=this.components.map(function(c){
		return options[optName+'.'+c];
	});
	this.inputs=this.components.map(function(c){
		return options[optName+'.'+c+'.input'];
	});
	this.minValues=this.components.map(function(c){
		return options[optName+'.'+c+'.min'];
	});
	this.maxValues=this.components.map(function(c){
		return options[optName+'.'+c+'.max'];
	});
	this.modeNoSliders=true; // no <input> elements with values that can be populated by the browser, disregarding default value
	// TODO count sliders instead, and then count mousemoves:
	// this.nSliders, nMousemoves, nVars instead of modeDim
	this.modeConstant=true;
	this.modeFloats=false;
	this.modeDim=0;
	this.components.forEach(function(c,i){
		var inputType=options[optName+'.'+c+'.input'];
		if (inputType!='constant') {
			this.modeConstant=false;
			if (this.modeDim++!=i) {
				this.modeFloats=true;
			}
		}
		if (inputType=='slider') {
			this.modeNoSliders=false;
		}
	},this);
	if (this.modeDim==1) {
		this.modeFloats=true;
	}
	this.modeVector= !this.modeConstant && !this.modeFloats;
	var nonnegativeLimits=this.minValues.every(function(v){return v>=0}) && this.maxValues.every(function(v){return v>=0});
	if (nonnegativeLimits) {
		this.formatValue=function(value){
			return value.toFixed(3);
		};
	} else {
		this.formatValue=function(value){
			return (value<=0 ? value<0 ? '' /* - */ : ' ' : '+')+value.toFixed(3);
		};
	}
};
Vector.prototype.varNameC=function(c){
	return this.varName+c.toUpperCase();
};

module.exports=Vector;
