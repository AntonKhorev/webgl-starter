'use strict';

const fixOptHelp=require('./fixed-options-helpers.js');
const Lines=require('./lines.js');
const listeners=require('./listeners.js');
const Feature=require('./feature.js');

class Vector extends Feature {
	constructor(name,values) {
		super();
		this.name=name;
		this.values=values;
		this.nVars=0;
		this.nSliders=0; // sliders are <input> elements with values that can be populated by the browser, disregarding default value
		this.nMousemoves=0;
		this.modeConstant=true;
		this.modeFloats=false;
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
		this.modeVector=(!this.modeConstant && !this.modeFloats);
	}
	updateFnName() {
		function capitalize(s) {
			return s.charAt(0).toUpperCase()+s.slice(1);
		}
		return 'update'+capitalize(this.name);
	}
	// fns that can be mapped over values/components:
	varNameC(c) {
		return this.name+c.toUpperCase();
	}
	componentValue(v,c) {
		if (v.input=='constant') {
			return fixOptHelp.formatNumber(v);
		} else if (v.input=='slider') {
			return "parseFloat(document.getElementById('"+this.name+"."+c+"').value)";
		} else if (v.input=='mousemovex' || v.input=='mousemovey') {
			return this.varNameC(c);
		}
	}
	// abstract fns:
	//writeJsInitStartLines() {} // Locs, fn calls, ets
	//writeJsUpdateFnLines() {}
	addPostToListenerEntryForComponent(entry,c) {} // do necessary entry.post()
	addPostToListenerEntryAfterComponents(entry) {}
	// public:
	getJsInitLines(featureContext) {
		const writeManyListenersLines=()=>{
			const lines=new Lines;
			this.values.forEach((v,c)=>{
				if (v.input!='slider') return;
				const listener=new listeners.SliderListener(this.name+'.'+c);
				listener.enter()
					.log("console.log(this.id,'input value:',parseFloat(this.value));")
					.post(this.updateFnName()+"();");
				lines.a(
					listener.write(!featureContext.isAnimated,featureContext.haveToLogInput)
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
				listener.write(!featureContext.isAnimated,featureContext.haveToLogInput)
			);
		};
		const lines=new Lines;
		lines.a(
			this.writeJsInitStartLines()
		);
		if (this.modeConstant) { // safe to skip this check
			return lines;
		}
		const manyListenersLines=writeManyListenersLines();
		const oneListenerLines=writeOneListenerLines();
		if (this.nSliders>0) {
			this.values.forEach((v,c)=>{
				if (v.input=='mousemovex' || v.input=='mousemovey') {
					lines.a(
						"var "+this.varNameC(c)+"="+fixOptHelp.formatNumber(v)+";"
					);
				}
			});
			lines.a(
				this.writeJsUpdateFnLines().wrap(
					"function "+this.updateFnName()+"() {",
					"}"
				),
				this.updateFnName()+"();",
				manyListenersLines.data.length<=oneListenerLines.data.length ? manyListenersLines : oneListenerLines
			);
		}
		if (this.nMousemoves>0) {
			const entry=featureContext.canvasMousemoveListener.enter();
			this.values.forEach((v,c)=>{
				if (v.input=='mousemovex' || v.input=='mousemovey') {
					const fmt=fixOptHelp.makeFormatNumber(v);
					if (this.nSliders==0) {
						entry.minMaxVarFloat(v.input,this.varNameC(c),
							fmt(v.min),
							fmt(v.max)
						);
					} else {
						entry.minMaxFloat(v.input,this.varNameC(c),
							fmt(v.min),
							fmt(v.max)
						);
					}
					entry.log("console.log('"+this.name+"."+c+" input value:',"+this.varNameC(c)+");");
					this.addPostToListenerEntryForComponent(entry,c);
				}
			});
			this.addPostToListenerEntryAfterComponents(entry);
		}
		return lines;
	}
}

module.exports=Vector;
