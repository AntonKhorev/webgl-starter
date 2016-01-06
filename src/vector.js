'use strict';

const Lines=require('./lines.js');
const listeners=require('./listeners.js');

//var Vector=function(name,components,option){
const Vector=function(name,values){
	this.name=name;
	//this.components=components.split(''); // TODO values.map((v,c)=>c)
	this.values=values;

	// TODO don't need them?
	// why they are here:
	// * need to iterate over components in order - can't do it over object
	// * need component names
	// would prefer: values.map((v,c,i)=>{...})
	/*
	this.values=this.components.map(c=>option[c]); // used by call-vector
	this.inputs=this.components.map(c=>option[c].input);
	this.minValues=this.components.map(c=>option[c].min);
	this.maxValues=this.components.map(c=>option[c].max);
	*/

	this.nVars=0;
	this.nSliders=0; // sliders are <input> elements with values that can be populated by the browser, disregarding default value
	this.nMousemoves=0;
	this.modeConstant=true;
	this.modeFloats=false;
	//this.components.forEach((c,i)=>{
		//const inputType=option[c].input;
		//if (inputType!='constant') {
	values.map((v,c,i)=>{
		if (v.input!='constant') {
			this.modeConstant=false;
			if (this.nVars++!=i) {
				this.modeFloats=true;
			}
		}
		this.nSliders+=v.input=='slider';
		this.nMousemoves+=(v.input=='mousemovex' || v.input=='mousemovey');
	});
	if (this.nVars==1) {
		this.modeFloats=true;
	}
	this.modeVector= !this.modeConstant && !this.modeFloats;
	//const nonnegativeLimits=this.minValues.every(v=>v>=0) && this.maxValues.every(v=>v>=0); // TODO move to options.fix() ... .out
	const nonnegativeLimits=values.every(v=>(v.min>=0 && v.max>=0)); // TODO move to options.fix() ... .out
	if (nonnegativeLimits) {
		this.formatValue=value=>value.toFixed(3);
	} else {
		this.formatValue=value=>(value<=0 ? value<0 ? '' /* - */ : ' ' : '+')+value.toFixed(3);
	}
};
Vector.prototype.updateFnName=function(){
	function capitalize(s) {
		return s.charAt(0).toUpperCase()+s.slice(1);
	}
	return 'update'+capitalize(this.name);
};
// fns that can be mapped over components: // TODO not anymore, .components are gone
Vector.prototype.varNameC=function(c){
	return this.name+c.toUpperCase();
};
/*
Vector.prototype.componentValue=function(c,i){
	if (this.inputs[i]=='constant') {
		return this.formatValue(this.values[i]);
	} else if (this.inputs[i]=='slider') {
		return "parseFloat(document.getElementById('"+this.optName+"."+c+"').value)";
	} else if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
		return this.varNameC(c);
	}
}
*/
Vector.prototype.componentValue=function(v,c){
	if (v.input=='constant') {
		return this.formatValue(v);
	} else if (v.input=='slider') {
		return "parseFloat(document.getElementById('"+this.name+"."+c+"').value)";
	} else if (v.input=='mousemovex' || v.input=='mousemovey') {
		return this.varNameC(c);
	}
}
// public:
Vector.prototype.getJsInterfaceLines=function(writeListenerArgs,canvasMousemoveListener){
	const writeManyListenersLines=()=>{
		const lines=new Lines;
		/*
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
		*/
		this.values.forEach((v,c)=>{
			if (v.input!='slider') return;
			const listener=new listeners.SliderListener(this.name+'.'+c);
			listener.enter()
				.log("console.log(this.id,'input value:',parseFloat(this.value));")
				.post(this.updateFnName()+"();");
			lines.a(
				listener.write.apply(listener,writeListenerArgs)
			);
		});
		return lines;
	};
	const writeOneListenerLines=()=>{
		const listener=new listeners.MultipleSliderListener("[id^=\""+this.name+".\"]");
		listener.enter()
			.log("console.log(this.id,'input value:',parseFloat(this.value));")
			.post(this.updateFnName()+"();");
		return new Lines(
			listener.write.apply(listener,writeListenerArgs)
		);
	};
	if (this.modeConstant) {
		return new Lines;
	}
	const lines=new Lines;
	const manyListenersLines=writeManyListenersLines();
	const oneListenerLines=writeOneListenerLines();
	lines.a(
		this.writeJsInterfaceGlslLines()
	);
	if (this.nSliders>0) {
		/*
		this.components.forEach(function(c,i){
			if (this.inputs[i]=='mousemovex' || this.inputs[i]=='mousemovey') {
				lines.a(
					"var "+this.varNameC(c)+"="+this.formatValue(this.values[i])+";"
				);
			}
		},this);
		*/
		this.values.forEach((v,c)=>{
			if (v.input=='mousemovex' || v.input=='mousemovey') {
				lines.a(
					"var "+this.varNameC(c)+"="+this.formatValue(v)+";"
				);
			}
		});
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
		/*
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
		*/
		this.values.forEach(function(v,c,i){
			if (v.input=='mousemovex' || v.input=='mousemovey') {
				if (this.nSliders==0) {
					entry.minMaxVarFloat(v.input,this.varNameC(c),
						this.formatValue(v.min),
						this.formatValue(v.max)
					);
				} else {
					entry.minMaxFloat(v.input,this.varNameC(c),
						this.formatValue(v.min),
						this.formatValue(v.max)
					);
				}
				entry.log("console.log('"+this.name+"."+c+" input value:',"+this.varNameC(c)+");");
				this.addPostToEntryForComponent(entry,c);
			}
		},this);
		this.addPostToEntryAfterComponents(entry);
	}
	return lines;
};

module.exports=Vector;
