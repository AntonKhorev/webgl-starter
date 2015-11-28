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
Uniform.prototype.getGlslDeclarationLines=function(){
	if (this.modeConstant) {
		return new Lines;
	} else if (this.modeFloats) {
		var lines=new Lines;
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='constant') return;
			var C=c.toUpperCase();
			lines.a(
				"uniform float "+this.varName+C+";"
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
	function formatSignedValue(value) {
		return (value<=0 ? value<0 ? '' /* - */ : ' ' : '+')+value.toFixed(3);
	}
	function varComponentMap(c,i) {
		var C=c.toUpperCase();
		if (this.inputs[i]=='constant') {
			return formatSignedValue(this.values[i]);
		} else {
			return this.varName+C;
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
Uniform.prototype.getJsInterfaceLines=function(writeListenerArgs){
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
			var C=c.toUpperCase();
			lines.a(
				"var "+this.varName+C+"Loc=gl.getUniformLocation(program,'"+this.varName+C+"');"
			);
		},this);
	} else {
		lines.a(
			"var "+this.varName+"Loc=gl.getUniformLocation(program,'"+this.varName+"');"
		);
	}
	var updateFnLines=new Lines;
	if (this.modeFloats) {
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='constant') return;
			var C=c.toUpperCase();
			updateFnLines.a(
				"gl.uniform1f("+this.varName+C+"Loc,parseFloat(document.getElementById('"+this.optName+"."+c+"').value));"
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
				"	parseFloat(document.getElementById('"+this.optName+"."+c+"').value)"
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
	return lines;
};

module.exports=Uniform;
