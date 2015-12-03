var Lines=require('./lines.js');
var listeners=require('./listeners.js');

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
	this.nVars=0;
	this.nSliders=0; // sliders are <input> elements with values that can be populated by the browser, disregarding default value
	this.nMousemoves=0;
	this.modeConstant=true;
	this.modeFloats=false;
	this.components.forEach(function(c,i){
		var inputType=options[optName+'.'+c+'.input'];
		if (inputType!='constant') {
			this.modeConstant=false;
			if (this.nVars++!=i) {
				this.modeFloats=true;
			}
		}
		this.nSliders+=inputType=='slider';
		this.nMousemoves+=(inputType=='mousemovex' || inputType=='mousemovey');
	},this);
	if (this.nVars==1) {
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
Vector.prototype.updateFnName=function(){
	function capitalize(s) {
		return s.charAt(0).toUpperCase()+s.slice(1);
	}
	return 'update'+capitalize(this.varName);
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
// public:
Vector.prototype.getJsInterfaceLines=function(writeListenerArgs,canvasMousemoveListener){
	function writeManyListenersLines() {
		var lines=new Lines;
		this.components.forEach(function(c,i){
			if (this.inputs[i]!='slider') return;
			var listener=new listeners.SliderListener(this.optName+'.'+c);
			listener.enter()
				.log("console.log(this.id,'input value:',parseFloat(this.value));")
				.post(this.updateFnName()+"();");
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
			.post(this.updateFnName()+"();");
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
	lines.a(
		this.writeJsInterfaceGlslLines()
	);
	if (this.nSliders>0) {
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
				lines.a(
					"var "+this.varNameC(c)+"="+this.formatValue(this.values[i])+";"
				);
			}
		},this);
		lines.a(
			this.writeJsInterfaceUpdateFnLines().wrap(
				"function "+this.updateFnName()+"() {",
				"}"
			),
			this.updateFnName()+"();",
			manyListenersLines.data.length<=oneListenerLines.data.length ? manyListenersLines : oneListenerLines
		);
	}
	if (this.nMousemoves>0) {
		var entry=canvasMousemoveListener.enter();
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
				if (this.nSliders==0) {
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
				this.addPostToEntryForComponent(entry,c);
			}
		},this);
		this.addPostToEntryAfterComponents(entry);
	}
	return lines;
};

module.exports=Vector;
