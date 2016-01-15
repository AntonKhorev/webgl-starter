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
			if (v.input!='constant' || v.speed!=0) {
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
	makeInitialComponentValue() {
		return (v,c)=>{
			if (v.input=='slider') {
				return "parseFloat(document.getElementById('"+this.htmlName+"."+c+"').value)"; // b/c slider could be init'd to a value different than the default
			} else {
				return fixOptHelp.formatNumber(v);
			}
		}
	}
	makeUpdatedComponentValue() {
		return (v,c)=>{
			if (v.speed!=0 || v.input instanceof Input.MouseMove) {
				return this.varNameC(c);
			} else if (v.input=='slider') {
				return "parseFloat(document.getElementById('"+this.htmlName+"."+c+"').value)";
			} else {
				return fixOptHelp.formatNumber(v);
			}
		}
	}
	// abstract fns:
	getJsDeclarationLines() { return new Lines; } // Locs etc
	getJsUpdateLines(componentValue) { return new Lines; }
	addPostToListenerEntryForComponent(entry,c) {} // do necessary entry.post()
	addPostToListenerEntryAfterComponents(entry,componentValue) {}
	// public:
	hasInputs() {
		return super.hasInputs() || this.values.some(v=>v.input!='constant');
	}
	requestFeatureContext(featureContext) {
		super.requestFeatureContext(featureContext);
		this.values.forEach(v=>{
			if (v.input!='constant') {
				featureContext.hasInputs=true;
			}
			if (v.input=='slider') {
				featureContext.hasSliders=true;
			}
			if (v.speed!=0) {
				if (v.input=='constant') {
					featureContext.hasStartTime=true;
				} else {
					featureContext.hasPrevTime=true;
				}
			}
		});
	}
	getHtmlControlMessageLines(i18n) {
		const lines=super.getHtmlControlMessageLines(i18n);
		this.values.forEach((v,c)=>{
			lines.a(
				this.getHtmlControlMessageForValue(i18n,v,this.name+'.'+c)
			);
		});
		return lines;
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
			this.getJsDeclarationLines()
		);
		const someSpeedNonzero=this.values.some(v=>v.speed!=0);
		if (!someSpeedNonzero && this.modeConstant) {
			lines.a(
				this.getJsUpdateLines(this.makeInitialComponentValue())
			);
			return lines;
		}
		const manyListenersLines=writeManyListenersLines();
		const oneListenerLines=writeOneListenerLines();
		this.values.forEach((v,c)=>{
			if (v.input instanceof Input.MouseMove && (this.nSliders>0 || someSpeedNonzero)) {
				lines.a(
					"var "+this.varNameC(c)+"="+fixOptHelp.formatNumber(v)+";"
				);
			}
		});
		if (!someSpeedNonzero && this.nSliders>0) {
			lines.a(
				this.getJsUpdateLines(this.makeUpdatedComponentValue()).wrap(
					"function "+this.updateFnName+"() {",
					"}"
				),
				this.updateFnName+"();",
				manyListenersLines.data.length<=oneListenerLines.data.length ? manyListenersLines : oneListenerLines
			);
		}
		if (this.nMousemoves>0) {
			if (!someSpeedNonzero && this.nSliders<=0) {
				// didn't call update in (this.nSliders>0) branch
				lines.a(
					this.getJsUpdateLines(this.makeInitialComponentValue())
				);
			}
			const entry=featureContext.canvasMousemoveListener.enter();
			this.values.forEach((v,c)=>{
				if (v.input instanceof Input.MouseMove) {
					const fmt=fixOptHelp.makeFormatNumber(v);
					if (!someSpeedNonzero && this.nSliders==0) {
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
					if (!someSpeedNonzero && this.nSliders==0) {
						this.addPostToListenerEntryForComponent(entry,c);
					}
				}
			});
			if (!someSpeedNonzero) {
				if (this.nSliders==0) {
					this.addPostToListenerEntryAfterComponents(entry,this.makeUpdatedComponentValue());
				} else {
					entry.post(this.updateFnName+"();");
				}
			}
		}
		return lines;
	}
	getJsLoopLines() {
		const lines=super.getJsLoopLines();
		const add=(s)=>{
			const c=s.charAt(0);
			if (c=='-' || c=='+') {
				return s;
			} else {
				return "+"+s;
			}
		};
		let needUpdate=false;
		this.values.forEach((v,c)=>{
			if (v.speed!=0) {
				needUpdate=true;
				const fmt=fixOptHelp.makeFormatNumber(v);
				const sfmt=fixOptHelp.makeFormatNumber(v.speed);
				const varName=this.varNameC(c);
				const incrementLine=(base,dt)=>
					"var "+varName+"=Math."+(v.speed<0?"max":"min")+"("+(v.speed<0?fmt(v.min):fmt(v.max))+","+base+add(sfmt(v.speed))+"*"+dt+"/1000);";
				if (v.input=='slider') {
					const inputVarName=this.varNameC(c)+"Input";
					lines.a(
						"var "+inputVarName+"=document.getElementById('"+this.htmlName+"."+c+"');",
						incrementLine("parseFloat("+inputVarName+".value)","(time-prevTime)"),
						inputVarName+".value="+varName+";"
					);
				} else {
					lines.a(
						incrementLine(fmt(v),"(time-startTime)")
					);
				}
			}
		});
		if (needUpdate) {
			lines.a(this.getJsUpdateLines(this.makeUpdatedComponentValue()));
		}
		return lines;
	}
}

module.exports=Vector;
