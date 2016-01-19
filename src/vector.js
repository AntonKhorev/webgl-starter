'use strict';

const fixOptHelp=require('./fixed-options-helpers.js');
const Input=require('./input-classes.js');
const Lines=require('./lines.js');
const Listener=require('./listener-classes.js');
const VectorComponent=require('./vector-component.js');
const NumericFeature=require('./numeric-feature.js');

function capitalize(s) {
	return s.charAt(0).toUpperCase()+s.slice(1);
}
function toCamelCase(s) {
	return s.split('.').map((w,i)=>i>0?capitalize(w):w).join('');
}

class Vector extends NumericFeature {
	constructor(name,values,wrapMode) {
		super();
		this.name=name; // name with dots like "material.color", transformed into "materialColor" for js var names
		this.components=[];
		this.componentsBySuffix={};
		values.forEach(v=>{
			const component=new VectorComponent(v,name,wrapMode);
			this.components.push(component);
			this.componentsBySuffix[component.suffix]=component;
		});
		// { TODO extra ctor args
		this.i18nId=name;
		// }
		this.nVars=0;
		this.modeConstant=true; // all vector components are constants
		this.modeFloats=false; // one/some vector components are variable, such components get their own glsl vars
		this.components.forEach((component,i)=>{
			if (component.variable) {
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
	get varName() { // js/glsl var name
		return toCamelCase(this.name);
	}
	get updateFnName() {
		return toCamelCase('update.'+this.name);
	}
	// fns that can be mapped over components:
	makeInitialComponentValue() {
		return component=>{
			if (component.value.input=='slider') {
				return "parseFloat(document.getElementById('"+component.name+"').value)"; // b/c slider could be init'd to a value different than the default
			} else {
				return fixOptHelp.formatNumber(component.value);
			}
		}
	}
	makeUpdatedComponentValue() {
		return component=>{
			if (
				component.value.speed!=0 || component.value.speed.input!='constant' ||
				component.value.input instanceof Input.MouseMove || component.value.input instanceof Input.Gamepad
			) {
				return component.varName;
			} else if (component.value.input=='slider') {
				return "parseFloat(document.getElementById('"+component.name+"').value)";
			} else {
				return fixOptHelp.formatNumber(component.value);
			}
		}
	}
	// abstract fns:
	getJsDeclarationLines() { return new Lines; } // Locs etc
	getJsUpdateLines(componentValue) { return new Lines; }
	addPostToListenerEntryForComponent(entry,component) {} // do necessary entry.post()
	addPostToListenerEntryAfterComponents(entry,componentValue) {} // TODO check if we need componentValue - GlslVector doesn't use it
	// public:
	hasInputs() {
		return super.hasInputs() || this.components.some(component=>component.hasInput());
	}
	requestFeatureContext(featureContext) {
		super.requestFeatureContext(featureContext);
		this.components.forEach(component=>{
			if (component.hasInput()) featureContext.hasInputs=true;
			if (component.hasInputClass(Input.Slider)) featureContext.hasSliders=true;
			if (component.hasInputClass(Input.Gamepad)) featureContext.pollsGamepad=true;
			if (component.usesStartTime()) featureContext.hasStartTime=true;
			if (component.usesPrevTime()) featureContext.hasPrevTime=true;
			if (component.wrapped) featureContext.hasWrapFn=true;
			if (component.clamped) featureContext.hasClampFn=true;
		});
	}
	getHtmlControlMessageLines(i18n) {
		const lines=super.getHtmlControlMessageLines(i18n);
		this.components.forEach(component=>{
			lines.a(
				this.getHtmlControlMessageForValue(i18n,component.value,this.i18nId+'.'+component.suffix),
				this.getHtmlControlMessageForValue(i18n,component.value.speed,this.i18nId+'.'+component.suffix+'.speed')
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
		this.components.forEach(component=>{
			writeInput(
				component.value,
				'options.'+this.i18nId+'.'+component.suffix,
				component.name
			);
			writeInput(
				component.value.speed,
				'options.'+this.i18nId+'.'+component.suffix+'.speed',
				component.name+'.speed'
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
				this.components.forEach(component=>{
					writeListener(component.value,component.name);
					writeListener(component.value.speed,component.name+'.speed');
				});
				return lines;
			};
			const getOneListenerLines=()=>{
				const listener=new Listener.MultipleSlider("[id^=\""+this.name+".\"]"); // will also handle speed sliders, but it's ok
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
		const someSpeeds=this.components.some(component=>component.hasSpeed());
		const someValueSliders=this.components.some(component=>component.value.input=='slider');
		const someGamepads=this.components.some(component=>component.hasInputClass(Input.Gamepad));
		this.components.forEach(component=>{
			if (
				(component.value.input instanceof Input.MouseMove && (someValueSliders || someSpeeds || someGamepads)) || // mouse input required elsewhere
				(component.value.speed.input!='constant' && component.value.input!='slider') // variable speed and no value input capable of storing the state
			) {
				lines.a(
					"var "+component.varName+"="+fixOptHelp.formatNumber(component.value)+";"
				);
			}
			if (component.value.speed.input instanceof Input.MouseMove) {
				lines.a(
					"var "+component.varNameSpeed+"="+fixOptHelp.formatNumber(component.value.speed)+";"
				);
			}
		});
		if (!someSpeeds && someValueSliders && !someGamepads) {
			lines.a(
				this.getJsUpdateLines(this.makeUpdatedComponentValue()).wrap(
					"function "+this.updateFnName+"() {",
					"}"
				),
				this.updateFnName+"();"
			);
		}
		lines.a(
			getSliderListenerLines(!someSpeeds && !someGamepads)
		);
		if (this.components.some(component=>(component.value.input instanceof Input.MouseMove))) {
			if (!someSpeeds && !someValueSliders && !someGamepads) {
				lines.a(
					this.getJsUpdateLines(this.makeInitialComponentValue())
				);
			}
			const entry=featureContext.canvasMousemoveListener.enter();
			this.components.forEach(component=>{
				if (component.value.input instanceof Input.MouseMove) {
					const fmt=fixOptHelp.makeFormatNumber(component.value);
					((!someSpeeds && !someValueSliders && !someGamepads) ? entry.minMaxVarFloat : entry.minMaxFloat)(
						component.value.input,component.varName,
						fmt(component.value.min),
						fmt(component.value.max)
					);
					entry.log("console.log('"+component.name+" input value:',"+component.varName+");");
					if (!someSpeeds && !someValueSliders && !someGamepads) {
						this.addPostToListenerEntryForComponent(entry,component);
					}
				}
			});
			if (!someSpeeds && !someGamepads) {
				if (!someValueSliders) {
					this.addPostToListenerEntryAfterComponents(entry,this.makeUpdatedComponentValue());
				} else {
					entry.post(this.updateFnName+"();");
				}
			}
		}
		if (this.components.some(component=>(component.value.speed.input instanceof Input.MouseMove))) {
			const entry=featureContext.canvasMousemoveListener.enter();
			this.components.forEach(component=>{
				const fmt=fixOptHelp.makeFormatNumber(component.value.speed);
				if (component.value.speed.input instanceof Input.MouseMove) {
					entry.minMaxFloat(component.value.speed.input,component.varNameSpeed,fmt(component.value.speed.min),fmt(component.value.speed.max))
						.log("console.log('"+component.name+".speed input value:',"+component.varNameSpeed+");");
				}
			});
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
		const writeGamepad=(component,v,dotSuffix,varSuffix)=>{
			if (v.input instanceof Input.Gamepad) {
				needUpdate=true;
				const fmt=fixOptHelp.makeFormatNumber(v);
				lines.a(
					"var "+component.minVarName+varSuffix+"="+fmt(v.min)+";",
					"var "+component.maxVarName+varSuffix+"="+fmt(v.max)+";",
					"var "+component.varName+varSuffix+"="+fmt(v)+";",
					"if (gamepad && gamepad.axes.length>"+v.input.axis+") {",
					"	"+component.varName+varSuffix+"="+component.minVarName+varSuffix+"+("+component.maxVarName+varSuffix+"-"+component.minVarName+varSuffix+")*(gamepad.axes["+v.input.axis+"]+1)/2;",
					"}"
				);
				if (featureContext && featureContext.debugOptions.inputs) { // TODO always pass featureContext
					lines.a(
						"console.log('"+component.name+dotSuffix+" input value:',"+component.varName+varSuffix+");"
					);
				}
			}
		};
		this.components.forEach(component=>{
			const v=component.value;
			writeGamepad(component,v,'','');
			writeGamepad(component,v.speed,'.speed','Speed');
			if (component.hasSpeed()) {
				needUpdate=true;
				const fmt=fixOptHelp.makeFormatNumber(v);
				const sfmt=fixOptHelp.makeFormatNumber(v.speed);
				let addSpeed;
				if (v.speed.input=='slider') {
					addSpeed="+parseFloat(document.getElementById('"+component.name+".speed').value)";
				} else if (v.speed.input instanceof Input.MouseMove || v.speed.input instanceof Input.Gamepad) {
					addSpeed="+"+component.varNameSpeed;
				} else {
					addSpeed=add(sfmt(v.speed));
				}
				let limitFn=(x,dx)=>{
					if (x==component.varName) {
						return dx.charAt(0)+"="+dx.slice(1);
					} else {
						return "="+x+dx;
					}
				}
				if (component.wrapped) {
					limitFn=(x,dx)=>"=wrap("+x+dx+","+fmt(v.max)+")";
				} else if (component.clamped) {
					limitFn=(x,dx)=>"=clamp("+x+dx+","+fmt(v.min)+","+fmt(v.max)+")";
				} else if (component.capped) {
					limitFn=(x,dx)=>"=Math."+(v.speed<0?"max":"min")+"("+x+dx+","+(v.speed<0?fmt(v.min):fmt(v.max))+")";
				}
				const incrementLine=(base,dt)=>component.varName+limitFn(base,addSpeed+"*"+dt+"/1000")+";";
				if (v.input=='slider') {
					lines.a(
						"var "+component.varNameInput+"=document.getElementById('"+component.name+"');",
						"var "+incrementLine("parseFloat("+component.varNameInput+".value)","(time-prevTime)"),
						component.varNameInput+".value="+component.varName+";"
					);
				} else if (v.input instanceof Input.MouseMove || v.speed.input!='constant') {
					lines.a(
						incrementLine(component.varName,"(time-prevTime)")
					);
				} else {
					lines.a(
						"var "+incrementLine(fmt(v),"(time-startTime)")
					);
				}
				if (featureContext && featureContext.debugOptions.animations) { // TODO always pass featureContext
					lines.a(
						"console.log('"+component.name+" animation value:',"+component.varName+");"
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
