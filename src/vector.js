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
		this.modeConstant=true; // all vector components are constants
		this.modeFloats=false; // one/some vector components are variable, such components get their own glsl vars
		values.map((v,c,i)=>{
			if (v.input!='constant' || v.speed!=0 || v.speed.input!='constant') {
				this.modeConstant=false;
				if (this.nVars++!=i) {
					this.modeFloats=true;
				}
			}
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
			if (v.speed!=0 || v.speed.input!='constant' || v.input instanceof Input.MouseMove) {
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
			if (v.input!='constant' || v.speed.input!='constant') {
				featureContext.hasInputs=true;
			}
			if (v.input=='slider' || v.speed.input=='slider') {
				featureContext.hasSliders=true;
			}
			if (v.speed!=0 || v.speed.input!='constant') {
				if (v.input=='constant' && v.speed.input=='constant') {
					featureContext.hasStartTime=true;
				} else {
					featureContext.hasPrevTime=true;
				}
			}
			if (v.speed.input!='constant') {
				featureContext.hasClampFn=true;
			}
		});
	}
	getHtmlControlMessageLines(i18n) {
		const lines=super.getHtmlControlMessageLines(i18n);
		this.values.forEach((v,c)=>{
			lines.a(
				this.getHtmlControlMessageForValue(i18n,v,this.name+'.'+c),
				this.getHtmlControlMessageForValue(i18n,v.speed,this.name+'.'+c+'.speed')
			);
		});
		return lines;
	}
	getHtmlInputLines(i18n) {
		const lines=super.getHtmlInputLines(i18n);
		const writeInput=(v,opName,htmlName)=>{
			if (v.input!='slider') return;
			const fmt=fixOptHelp.makeFormatNumber(v);
			lines.a(
				"<div>",
				"	<label for='"+htmlName+"'>"+i18n(opName)+":</label>",
				"	<span class='min'>"+i18n(opName+'.value',v.min)+"</span>",
				"	<input type='range' id='"+htmlName+"' min='"+fmt(v.min)+"' max='"+fmt(v.max)+"' value='"+fmt(v)+"' step='any' />",
				"	<span class='max'>"+i18n(opName+'.value',v.max)+"</span>",
				"</div>"
			);
		};
		this.values.forEach((v,c)=>{
			writeInput(
				v,
				'options.'+this.name+'.'+c,
				this.htmlName+'.'+c
			);
			writeInput(
				v.speed,
				'options.'+this.name+'.'+c+'.speed',
				this.htmlName+'.'+c+'.speed'
			);
		});
		return lines;
	}
	getJsInitLines(featureContext) {
		const getSliderListenerLines=(doUpdate)=>{
			const getManyListenersLines=()=>{
				const lines=new Lines;
				const writeListener=(v,htmlName)=>{
					if (v.input!='slider') return;
					const listener=new Listener.Slider(htmlName);
					const entry=listener.enter();
					entry.log("console.log(this.id,'input value:',parseFloat(this.value));");
					if (doUpdate) {
						entry.post(this.updateFnName+"();");
					}
					lines.a(
						featureContext.getListenerLines(listener)
					);
				}
				this.values.forEach((v,c)=>{
					writeListener(v,this.htmlName+'.'+c);
					writeListener(v.speed,this.htmlName+'.'+c+'.speed');
				});
				return lines;
			};
			const getOneListenerLines=()=>{
				const listener=new Listener.MultipleSlider("[id^=\""+this.htmlName+".\"]"); // will also handle speed sliders, but it's ok
				const entry=listener.enter();
				entry.log("console.log(this.id,'input value:',parseFloat(this.value));");
				if (doUpdate) {
					entry.post(this.updateFnName+"();");
				}
				return new Lines(
					featureContext.getListenerLines(listener)
				);
			};
			const manyListenersLines=getManyListenersLines();
			const oneListenerLines=getOneListenerLines();
			return manyListenersLines.data.length<=oneListenerLines.data.length ? manyListenersLines : oneListenerLines;
		};
		const lines=super.getJsInitLines(featureContext);
		lines.a(
			this.getJsDeclarationLines()
		);
		if (this.modeConstant) {
			lines.a(
				this.getJsUpdateLines(this.makeInitialComponentValue())
			);
			return lines;
		}
		const someSpeeds=this.values.some(v=>(v.speed!=0 || v.speed.input!='constant'));
		const someValueSliders=this.values.some(v=>v.input=='slider');
		this.values.forEach((v,c)=>{
			if (
				(v.input instanceof Input.MouseMove && (someValueSliders || someSpeeds)) || // mouse input required elsewhere
				(v.speed.input!='constant' && v.input!='slider') // variable speed and no value input capable of storing the state
			) {
				lines.a(
					"var "+this.varNameC(c)+"="+fixOptHelp.formatNumber(v)+";"
				);
			}
		});
		if (!someSpeeds && someValueSliders) {
			lines.a(
				this.getJsUpdateLines(this.makeUpdatedComponentValue()).wrap(
					"function "+this.updateFnName+"() {",
					"}"
				),
				this.updateFnName+"();"
			);
		}
		lines.a(
			getSliderListenerLines(!someSpeeds)
		);
		if (this.values.some(v=>(v.input instanceof Input.MouseMove))) {
			if (!someSpeeds && !someValueSliders) {
				lines.a(
					this.getJsUpdateLines(this.makeInitialComponentValue())
				);
			}
			const entry=featureContext.canvasMousemoveListener.enter();
			this.values.forEach((v,c)=>{
				if (v.input instanceof Input.MouseMove) {
					const fmt=fixOptHelp.makeFormatNumber(v);
					if (!someSpeeds && !someValueSliders) {
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
					if (!someSpeeds && !someValueSliders) {
						this.addPostToListenerEntryForComponent(entry,c);
					}
				}
			});
			if (!someSpeeds) {
				if (!someValueSliders) {
					this.addPostToListenerEntryAfterComponents(entry,this.makeUpdatedComponentValue());
				} else {
					entry.post(this.updateFnName+"();");
				}
			}
		}
		return lines;
	}
	getJsLoopLines(featureContext) {
		const lines=super.getJsLoopLines(featureContext);
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
			if (v.speed!=0 || v.speed.input!='constant') {
				needUpdate=true;
				const fmt=fixOptHelp.makeFormatNumber(v);
				const sfmt=fixOptHelp.makeFormatNumber(v.speed);
				const varName=this.varNameC(c);
				const htmlName=this.htmlName+"."+c;
				let addSpeed=add(sfmt(v.speed));
				if (v.speed.input=='slider') {
					addSpeed="+parseFloat(document.getElementById('"+htmlName+".speed').value)";
				}
				let limitFn;
				if (v.speed.input=='constant') {
					limitFn=x=>"Math."+(v.speed<0?"max":"min")+"("+x+","+(v.speed<0?fmt(v.min):fmt(v.max))+")";
				} else {
					limitFn=x=>"clamp("+x+","+fmt(v.min)+","+fmt(v.max)+")";
				}
				const incrementLine=(base,dt)=>varName+"="+limitFn(base+addSpeed+"*"+dt+"/1000")+";";
				if (v.input=='slider') {
					const inputVarName=varName+"Input";
					lines.a(
						"var "+inputVarName+"=document.getElementById('"+htmlName+"');",
						"var "+incrementLine("parseFloat("+inputVarName+".value)","(time-prevTime)"),
						inputVarName+".value="+varName+";"
					);
				} else if (v.input instanceof Input.MouseMove || v.speed.input=='slider') {
					lines.a(
						incrementLine(varName,"(time-prevTime)")
					);
				} else {
					lines.a(
						"var "+incrementLine(fmt(v),"(time-startTime)")
					);
				}
				if (featureContext && featureContext.debugOptions.animations) { // TODO always pass featureContext
					lines.a(
						"console.log('"+htmlName+" animation value:',"+varName+");"
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
