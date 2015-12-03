var Lines=require('./lines.js');
var Vector=require('./vector.js');

var GlslVector=function(varName,optName,components,options){
	Vector.call(this,varName,optName,components,options);
};
GlslVector.prototype=Object.create(Vector.prototype);
GlslVector.prototype.constructor=GlslVector;
// public:
GlslVector.prototype.getGlslDeclarationLines=function(){
	if (this.modeConstant) {
		return new Lines;
	} else if (this.modeFloats) {
		var lines=new Lines;
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='constant') return;
			lines.a(
				"uniform float "+this.varNameC(c)+";"
			);
		},this);
		return lines;
	} else {
		return new Lines(
			"uniform vec"+this.nVars+" "+this.varName+";"
		);
	}
};
GlslVector.prototype.getGlslValue=function(){
	var vecType="vec"+this.values.length;
	function varComponentMap(c,i) {
		if (this.inputs[i]=='constant') {
			return this.formatValue(this.values[i]);
		} else {
			return this.varNameC(c);
		}
	}
	var vs=this.components.map(varComponentMap,this);
	if (this.modeConstant) {
		var equalValues=vs.every(function(v){
			return v==vs[0];
		});
		if (equalValues) {
			return vecType+"("+vs[0]+")"; // see OpenGL ES SL section 5.4.2
		} else {
			return vecType+"("+vs.join(",")+")";
		}
	} else if (!this.modeFloats) {
		vs=vs.slice(this.nVars);
		if (vs.length==0) {
			return this.varName;
		}
		vs.unshift(this.varName);
	}
	return vecType+"("+vs.join(",")+")";
};
GlslVector.prototype.writeLocLines=function(){
	lines=new Lines;
	if (this.modeFloats) {
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='constant') return;
			lines.a(
				"var "+this.varNameC(c)+"Loc=gl.getUniformLocation(program,'"+this.varNameC(c)+"');"
			);
		},this);
	} else {
		lines.a(
			"var "+this.varName+"Loc=gl.getUniformLocation(program,'"+this.varName+"');"
		);
	}
	if (this.nSliders==0 && this.modeVector) {
		lines.a(
			"gl.uniform"+this.nVars+"f("+this.varName+"Loc"
		);
		this.components.forEach(function(c,i){
			if (this.inputs[i]!='constant') {
				lines.t(
					","+this.formatValue(this.values[i])
				);
			}
		},this);
		lines.t(
			");"
		);
	} else if (this.nSliders==0) {
		this.components.forEach(function(c,i){
			if (this.inputs[i]!='constant') {
				lines.a(
					"gl.uniform1f("+this.varNameC(c)+"Loc,"+this.formatValue(this.values[i])+");"
				);
			}
		},this);
	}
	return lines;
};
GlslVector.prototype.writeUpdateFnLines=function() {
	var updateFnLines=new Lines;
	if (this.modeFloats) {
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='constant') return;
			updateFnLines.a(
				"gl.uniform1f("+this.varNameC(c)+"Loc,"+this.componentValue(c,i)+");"
			);
		},this);
	} else {
		updateFnLines.a(
			"gl.uniform"+this.nVars+"f("+this.varName+"Loc"
		);
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='constant') return;
			updateFnLines.t(
				",",
				"	"+this.componentValue(c,i)
			);
		},this);
		updateFnLines.a(
			");"
		);
	}
	return updateFnLines;
};
GlslVector.prototype.writeMousemoveEach=function(entry,c){
	if (this.nSliders==0 && this.modeVector) {
		// written at the end as a vector
	} else if (this.nSliders==0) {
		entry.post("gl.uniform1f("+this.varNameC(c)+"Loc,"+this.varNameC(c)+");");
	} else {
		entry.post(this.updateFnName()+"();");
	}
};
GlslVector.prototype.writeMousemoveEnd=function(entry){
	if (this.nSliders==0 && this.modeVector) {
		var vs=[];
		this.components.forEach(function(c,i){
			if (i<this.nVars) {
				vs.push(this.varNameC(c));
			}
		},this);
		entry.post("gl.uniform"+this.nVars+"f("+this.varName+"Loc,"+vs.join(",")+");");
	}
};

module.exports=GlslVector;
