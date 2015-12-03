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
	//this.nVars=0;
	this.nSliders=0; // sliders are <input> elements with values that can be populated by the browser, disregarding default value
	//this.nMousemoves=0;
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
		this.nSliders+=inputType=='slider';
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
// fns that can be mapped over components:
Vector.prototype.varNameC=function(c){
	return this.varName+c.toUpperCase();
};
Vector.prototype.componentValue=function(c,i){
	if (this.inputs[i]=='constant') {
		return this.formatValue(this.values[i]);
	} else if (this.inputs[i]=='slider') {
		return "parseFloat(document.getElementById('"+this.optName+"."+c+"').value)";
	} else if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
		return this.varNameC(c);
	}
}

module.exports=Vector;
