'use strict';

const fixOptHelp=require('./fixed-options-helpers.js');
const Input=require('./input-classes.js');
const Lines=require('./lines.js');
const Listener=require('./listener-classes.js');
const NumericFeature=require('./numeric-feature.js');

class Vector extends NumericFeature {
	constructor(name,values) {
		super();
		this.name=name; // name with dots like "material.color", transformed into "materialColor" for js var names
		this.htmlName=name; // html id - ok to rewrite this property - Transforms does it
		this.varName=this.convertStringToCamelCase(name); // js/glsl var name - ok to rewrite this property - Transforms does it
		this.values=values;
		this.nVars=0;
		this.nSliders=0; // sliders are <input> elements with values that can be populated by the browser, disregarding default value
		this.nMousemoves=0;
		this.modeConstant=true; // all vector components are constants
		this.modeFloats=false; // one/some vector components are variable, such components get their own glsl vars
		values.map((v,c,i)=>{
			if (v.input!='constant') {
				this.modeConstant=false;
				if (this.nVars++!=i) {
					this.modeFloats=true;
				}
			}
			this.nSliders+=v.input=='slider';
			this.nMousemoves+=(v.input instanceof Input.MouseMove);
		});
		if (this.nVars==1) {
			this.modeFloats=true;
		}
		this.modeVector=(!this.modeConstant && !this.modeFloats); // first consecutive components are variable, packed into one glsl vector
	}
	convertStringToCamelCase(s) { // TODO static
		function capitalize(s) {
			return s.charAt(0).toUpperCase()+s.slice(1);
		}
		return s.split('.').map((w,i)=>i>0?capitalize(w):w).join('');
	}
	get updateFnName() {
		return this.convertStringToCamelCase('update.'+this.varName);
	}
	// fns that can be mapped over values/components:
	varNameC(c) {
		return this.convertStringToCamelCase(this.varName+'.'+c);
	}
	componentValue(v,c) {
		if (v.input=='constant') {
			return fixOptHelp.formatNumber(v);
		} else if (v.input=='slider') {
			return "parseFloat(document.getElementById('"+this.htmlName+"."+c+"').value)";
		} else if (v.input instanceof Input.MouseMove) {
			return this.varNameC(c);
		}
	}
	// abstract fns:
	//writeJsInitStartLines() {} // Locs, fn calls, ets
	//writeJsUpdateFnLines() {}
	addPostToListenerEntryForComponent(entry,c) {} // do necessary entry.post()
	addPostToListenerEntryAfterComponents(entry) {}
	// public:
	hasInputs() {
		return super.hasInputs() || this.values.some(v=>v.input!='constant');
	}
	requestFeatureContext(featureContext) {
		super.requestFeatureContext(featureContext);
		if (this.values.some(v=>v.input!='constant')) {
			featureContext.hasInputs=true;
		}
		if (this.nSliders>0) {
			featureContext.hasSliders=true;
		}
	}
	getHtmlInputLines(i18n) {
		const lines=super.getHtmlInputLines(i18n);
		this.values.forEach((v,c)=>{
			if (v.input!='slider') return;
			const opnamec='options.'+this.name+'.'+c;
			const fmt=fixOptHelp.makeFormatNumber(v);
			lines.a(
				"<div>",
				"	<label for='"+this.htmlName+"."+c+"'>"+i18n(opnamec)+":</label>",
				"	<span class='min'>"+i18n(opnamec+'.value',v.min)+"</span>",
				"	<input type='range' id='"+this.htmlName+"."+c+"' min='"+fmt(v.min)+"' max='"+fmt(v.max)+"' value='"+fmt(v)+"' step='any' />",
				"	<span class='max'>"+i18n(opnamec+'.value',v.max)+"</span>",
				"</div>"
			);
		});
		return lines;
	}
	getJsInitLines(featureContext) {
		const lines=super.getJsInitLines(featureContext);
		const writeManyListenersLines=()=>{
			const lines=new Lines;
			this.values.forEach((v,c)=>{
				if (v.input!='slider') return;
				const listener=new Listener.Slider(this.name+'.'+c);
				listener.enter()
					.log("console.log(this.id,'input value:',parseFloat(this.value));")
					.post(this.updateFnName+"();");
				lines.a(
					featureContext.getListenerLines(listener)
				);
			});
			return lines;
		};
		const writeOneListenerLines=()=>{
			const listener=new Listener.MultipleSlider("[id^=\""+this.htmlName+".\"]");
			listener.enter()
				.log("console.log(this.id,'input value:',parseFloat(this.value));")
				.post(this.updateFnName+"();");
			return new Lines(
				featureContext.getListenerLines(listener)
			);
		};
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
				if (v.input instanceof Input.MouseMove) {
					lines.a(
						"var "+this.varNameC(c)+"="+fixOptHelp.formatNumber(v)+";"
					);
				}
			});
			lines.a(
				this.writeJsUpdateFnLines().wrap(
					"function "+this.updateFnName+"() {",
					"}"
				),
				this.updateFnName+"();",
				manyListenersLines.data.length<=oneListenerLines.data.length ? manyListenersLines : oneListenerLines
			);
		}
		if (this.nMousemoves>0) {
			const entry=featureContext.canvasMousemoveListener.enter();
			this.values.forEach((v,c)=>{
				if (v.input instanceof Input.MouseMove) {
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
					entry.log("console.log('"+this.htmlName+"."+c+" input value:',"+this.varNameC(c)+");");
					this.addPostToListenerEntryForComponent(entry,c);
				}
			});
			this.addPostToListenerEntryAfterComponents(entry);
		}
		return lines;
	}
}

module.exports=Vector;
