var Lines=require('./lines.js');
var listeners=require('./listeners.js');

var GlslVector=function(varName,optName,components,options){
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
GlslVector.prototype.varNameC=function(c){
	return this.varName+c.toUpperCase();
};
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
			"uniform vec"+this.modeDim+" "+this.varName+";"
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
		vs=vs.slice(this.modeDim);
		if (vs.length==0) {
			return this.varName;
		}
		vs.unshift(this.varName);
	}
	return vecType+"("+vs.join(",")+")";
};
GlslVector.prototype.getJsInterfaceLines=function(writeListenerArgs,canvasMousemoveListener){
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
	function writeUpdateFnLines() {
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
				"gl.uniform"+this.modeDim+"f("+this.varName+"Loc"
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
		return updateFnLines;
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
	if (this.modeNoSliders && this.modeDim==1) {
		this.components.forEach(function(c,i){
			if (this.inputs[i]!='constant') {
				lines.a(
					"gl.uniform1f("+this.varNameC(c)+"Loc,"+this.formatValue(this.values[i])+");"
				);
			}
		},this);
	} else if (this.modeNoSliders && this.modeVector) {
		lines.a(
			"gl.uniform"+this.modeDim+"f("+this.varName+"Loc"
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
	} else {
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
				lines.a(
					"var "+this.varNameC(c)+"="+this.formatValue(this.values[i])+";"
				);
			}
		},this);
		lines.a(
			writeUpdateFnLines.call(this).wrap(
				"function "+updateFnName+"() {",
				"}"
			),
			updateFnName+"();",
			manyListenersLines.data.length<=oneListenerLines.data.length ? manyListenersLines : oneListenerLines
		);
	}
	if (canvasMousemoveListener) {
		var entry;
		var vs=[];
		if (this.modeNoSliders && this.modeVector) {
			entry=canvasMousemoveListener.enter(); // one entry - final post() is dependent on all previous lines
		}
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
				if (!(this.modeNoSliders && this.modeVector)) {
					entry=canvasMousemoveListener.enter(); // several independent entries
				}
				if (this.modeNoSliders && (this.modeDim==1 || this.modeVector)) {
					entry.minMaxVarFloat(this.inputs[i],this.varNameC(c),
						this.formatValue(this.minValues[i]),
						this.formatValue(this.maxValues[i])
					);
				} else {
					entry.minMaxFloat(this.inputs[i],this.varNameC(c),
						this.formatValue(this.minValues[i]),
						this.formatValue(this.maxValues[i])
					);
				}
				entry.log("console.log('"+this.optName+"."+c+" input value:',"+this.varNameC(c)+");");
				if (this.modeNoSliders && this.modeDim==1) {
					entry.post("gl.uniform1f("+this.varNameC(c)+"Loc,"+this.varNameC(c)+");");
				} else if (this.modeNoSliders && this.modeVector) {
					vs.push(this.varNameC(c));
				} else {
					entry.post(updateFnName+"();");
				}
			}
		},this);
		if (this.modeNoSliders && this.modeVector) {
			entry.post("gl.uniform"+this.modeDim+"f("+this.varName+"Loc,"+vs.join(",")+");");
		}
	}
	return lines;
};

module.exports=GlslVector;
