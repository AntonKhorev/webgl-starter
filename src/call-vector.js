var Lines=require('./lines.js');
var listeners=require('./listeners.js');
var Vector=require('./vector.js');

var CallVector=function(varName,optName,components,options,calledFn,calledFnDefaultArgs){
	Vector.call(this,varName,optName,components,options);
	this.calledFn=calledFn;
	this.calledFnDefaultArgs=calledFnDefaultArgs;
};
CallVector.prototype=Object.create(Vector.prototype);
CallVector.prototype.constructor=CallVector;
CallVector.prototype.getJsInitLines=function(){
	if (!this.modeNoSliders || this.values.every(function(v,i){
		return v==this.calledFnDefaultArgs[i];
	},this)) {
		return new Lines;
	}
	return new Lines(
		this.calledFn+"("+this.values.map(this.formatValue).join(",")+");"
	);
};
CallVector.prototype.getJsInterfaceLines=function(writeListenerArgs,canvasMousemoveListener){
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
		/*
		if (this.modeFloats) {
			this.components.forEach(function(c,i){
				if (this.inputs[i]=='constant') return;
				updateFnLines.a(
					"gl.uniform1f("+this.varNameC(c)+"Loc,"+this.componentValue(c,i)+");"
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
					"	"+this.componentValue(c,i)
				);
			},this);
			updateFnLines.a(
				");"
			);
		}
		*/
		// try checking # of sliders for glsl too {
		var nSliders=0;
		this.components.forEach(function(c,i){
			nSliders+=this.inputs[i]=='slider';
		},this);
		if (nSliders<=1) {
			updateFnLines.a(
				this.calledFn+"("+this.components.map(this.componentValue,this).join(",")+");"
			);
		} else if (nSliders==this.components.length) {
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
		// }
		return updateFnLines;
	}
	if (this.modeConstant) {
		return new Lines;
	}
	var lines=new Lines;
	var manyListenersLines=writeManyListenersLines.call(this);
	var oneListenerLines=writeOneListenerLines.call(this);
	/*
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
	*/
	/*
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
	*/
	// {
	if (!this.modeNoSliders) {
	// }
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
		/*
		if (this.modeNoSliders && this.modeVector) {
			entry=canvasMousemoveListener.enter(); // one entry - final post() is dependent on all previous lines
		}
		*/
		// {
		var hasMousemoves=false;
		// }
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
				// {
				if (!hasMousemoves) {
					hasMousemoves=true;
					entry=canvasMousemoveListener.enter(); // one entry - final post() is dependent on all previous lines
				}
				// }
				/*
				if (!(this.modeNoSliders && this.modeVector)) {
					entry=canvasMousemoveListener.enter(); // several independent entries
				}
				*/
				if (this.modeNoSliders /* && (this.modeDim==1 || this.modeVector)*/) {
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
				/*
				if (this.modeNoSliders && this.modeDim==1) {
					entry.post("gl.uniform1f("+this.varNameC(c)+"Loc,"+this.varNameC(c)+");");
				} else if (this.modeNoSliders && this.modeVector) {
					vs.push(this.varNameC(c));
				} else {
					entry.post(updateFnName+"();");
				}
				*/
			}
		},this);
		/*
		if (this.modeNoSliders && this.modeVector) {
			entry.post("gl.uniform"+this.modeDim+"f("+this.varName+"Loc,"+vs.join(",")+");");
		}
		*/
		// {
		if (hasMousemoves) {
			if (this.modeNoSliders) {
				entry.post(
					this.calledFn+"("+this.components.map(this.componentValue,this).join(",")+");"
				);
			} else {
				entry.post(updateFnName+"();");
			}
		}
		// }
	}
	return lines;
};

module.exports=CallVector;
