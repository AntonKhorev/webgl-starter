var Lines=require('./lines.js');
var listeners=require('./listeners.js');

var Uniform=function(varName,optName,components,options){
	this.varName=varName;
	this.optName=optName;
	this.components=components.split('');
	this.values=this.components.map(function(c){
		return options[optName+'.'+c];
	});
	this.inputs=this.components.map(function(c){
		return options[optName+'.'+c+'.input'];
	});
	this.modeConstant=true;
	this.modeFloats=false;
	this.modeVectorDim=0;
	this.components.forEach(function(c,i){
		var isVar=options[optName+'.'+c+'.input']!='constant';
		if (isVar) {
			this.modeConstant=false;
			if (this.modeVectorDim==i) {
				this.modeVectorDim++;
			} else {
				this.modeVectorDim=0;
				this.modeFloats=true;
			}
		}
	},this);
	if (this.modeVectorDim==1) {
		this.modeFloats=true;
		this.modeVectorDim=0;
	}
};
Uniform.prototype.formatSignedValue=function(value){
	return (value<=0 ? value<0 ? '' /* - */ : ' ' : '+')+value.toFixed(3);
};
Uniform.prototype.varNameC=function(c){
	return this.varName+c.toUpperCase();
};
// public:
Uniform.prototype.getGlslDeclarationLines=function(){
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
			"uniform vec"+this.modeVectorDim+" "+this.varName+";"
		);
	}
};
Uniform.prototype.getGlslValue=function(){
	var vecType="vec"+this.values.length;
	function varComponentMap(c,i) {
		if (this.inputs[i]=='constant') {
			return this.formatSignedValue(this.values[i]);
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
		vs=vs.slice(this.modeVectorDim);
		if (vs.length==0) {
			return this.varName;
		}
		vs.unshift(this.varName);
	}
	return vecType+"("+vs.join(",")+")";
};
Uniform.prototype.getJsInterfaceLines=function(writeListenerArgs,canvasMousemoveListener){
	function capitalize(s) {
		return s.charAt(0).toUpperCase()+s.slice(1);
	}
	var updateFnName='update'+capitalize(this.varName);
	function writeManyListenersLines() {
		var lines=new Lines;
		this.components.forEach(function(c,i){
			if (this.inputs[i]!='slider') return;
			var listener=new listeners.SliderListener(this.optName+'.'+c);
			listener.enter()
				.log("console.log(this.id,'input value:',parseFloat(this.value));")
				.post(updateFnName+"();");
			lines.a(
				listener.write.apply(listener,writeListenerArgs)
			);
		},this);
		return lines;
	}
	function writeOneListenerLines() {
		var listener=new listeners.MultipleSliderListener("[id^=\""+this.optName+".\"]");
		listener.enter()
			.log("console.log(this.id,'input value:',parseFloat(this.value));")
			.post(updateFnName+"();");
		return new Lines(
			listener.write.apply(listener,writeListenerArgs)
		);
	}
	if (this.modeConstant) {
		return new Lines;
	}
	var lines=new Lines;
	var manyListenersLines=writeManyListenersLines.call(this);
	var oneListenerLines=writeOneListenerLines.call(this);
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
	this.components.forEach(function(c,i){
		if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
			lines.a(
				"var "+this.varNameC(c)+"="+this.formatSignedValue(this.values[i])+";"
			);
		}
	},this);
	var updateFnLines=new Lines;
	function componentValue(c,i) {
		if (this.inputs[i]=='slider') {
			return "parseFloat(document.getElementById('"+this.optName+"."+c+"').value)";
		} else if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
			return this.varNameC(c);
		}
	}
	if (this.modeFloats) {
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='constant') return;
			updateFnLines.a(
				"gl.uniform1f("+this.varNameC(c)+"Loc,"+componentValue.call(this,c,i)+");"
			);
		},this);
	} else {
		updateFnLines.a(
			"gl.uniform"+this.modeVectorDim+"f("+this.varName+"Loc"
		);
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='constant') return;
			updateFnLines.t(
				",",
				"	"+componentValue.call(this,c,i)
			);
		},this);
		updateFnLines.a(
			");"
		);
	}
	lines.a(
		updateFnLines.wrap(
			"function "+updateFnName+"() {",
			"}"
		),
		updateFnName+"();",
		manyListenersLines.data.length<=oneListenerLines.data.length ? manyListenersLines : oneListenerLines
	);
	if (canvasMousemoveListener) {
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
				canvasMousemoveListener.enter()
					.minMaxFloat(this.inputs[i],this.varNameC(c),'-4','+4') // TODO supply ranges
					.log("console.log('"+this.optName+"."+c+" input value:',"+this.varNameC(c)+");")
					.post(updateFnName+"();");
			}
		},this);
	}
	return lines;
};

module.exports=Uniform;
