'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')
const formatNumber=require('crnx-base/format-number')
const formatNumbers=require('crnx-base/format-numbers')
const Input=require('./input-classes')
const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const Listener=require('./listener-classes')
const VectorComponent=require('./vector-component')
const NumericFeature=require('./numeric-feature')

class Vector extends NumericFeature {
	constructor(name,values,wrapRange) {
		super()
		this.name=name // name with dots like "material.color", transformed into "materialColor" for js var names
		this.components=[]
		this.componentsBySuffix={}
		values.forEach(v=>{
			const component=new VectorComponent(v,name,wrapRange)
			this.components.push(component)
			this.componentsBySuffix[component.suffix]=component
		})
		// { TODO extra ctor args
		this.i18nId=name
		// }
		this.nVars=0
		this.modeConstant=true // all vector components are constants
		this.modeFloats=false // one/some vector components are variable, such components get their own glsl vars
		this.components.forEach((component,i)=>{
			if (component.variable) {
				this.modeConstant=false
				if (this.nVars++!=i) {
					this.modeFloats=true
				}
			}
		})
		if (this.nVars==1) {
			this.modeFloats=true
		}
		this.modeVector=(!this.modeConstant && !this.modeFloats) // first consecutive components are variable, packed into one glsl vector
	}
	get varName() { // js/glsl var name
		return camelCase(this.name)
	}
	get updateFnName() {
		return camelCase('update.'+this.name)
	}
	// fns that can be mapped over components:
	makeInitialComponentValue() {
		const numbers={}
		this.components.forEach(component=>{
			if (component.value.input=='slider') {
				// don't need formatted number for this case
			} else {
				numbers[component.value.name]=component.value
			}
		})
		const fmt=formatNumbers.js(numbers)
		return component=>{
			if (component.value.input=='slider') {
				return "parseFloat(document.getElementById('"+component.name+"').value)" // b/c slider could be init'd to a value different than the default
			} else {
				return fmt[component.value.name]
			}
		}
	}
	makeUpdatedComponentValue() {
		const numbers={}
		this.components.forEach(component=>{
			if (
				component.value.speed!=0 || component.value.speed.input!='constant' ||
				component.value.input instanceof Input.MouseMove || component.value.input instanceof Input.Gamepad
			) {
				// don't need formatted number for this case
			} else if (component.value.input=='slider') {
				// don't need formatted number for this case
			} else {
				numbers[component.value.name]=component.value
			}
		})
		const fmt=formatNumbers.js(numbers)
		return component=>{
			if (
				component.value.speed!=0 || component.value.speed.input!='constant' ||
				component.value.input instanceof Input.MouseMove || component.value.input instanceof Input.Gamepad
			) {
				return component.varName
			} else if (component.value.input=='slider') {
				return "parseFloat(document.getElementById('"+component.name+"').value)"
			} else {
				return fmt[component.value.name]
			}
		}
	}
	// abstract fns:
	getJsDeclarationLines() { return JsLines.be() } // Locs etc
	getJsUpdateLines(componentValue) { return JsLines.be() }
	addPostToListenerEntryForComponent(entry,component) {} // do necessary entry.post()
	addPostToListenerEntryAfterComponents(entry,componentValue) {} // TODO check if we need componentValue - GlslVector doesn't use it
	// public:
	hasInputs() {
		return super.hasInputs() || this.components.some(component=>component.hasInput())
	}
	requestFeatureContext(featureContext) {
		super.requestFeatureContext(featureContext)
		this.components.forEach(component=>{
			if (component.hasInput()) featureContext.hasInputs=true
			if (component.hasInputClass(Input.Slider)) featureContext.hasSliders=true
			if (component.hasInputClass(Input.Gamepad)) featureContext.pollsGamepad=true
			if (component.usesStartTime()) featureContext.hasStartTime=true
			if (component.usesPrevTime()) featureContext.hasPrevTime=true
			if (component.wrapped) featureContext.hasWrapFn=true
			if (component.clamped) featureContext.hasClampFn=true
		})
	}
	getHtmlControlMessageLines(i18n) {
		const a=Lines.ba(super.getHtmlControlMessageLines(i18n))
		this.components.forEach(component=>{
			a(
				this.getHtmlControlMessageForValue(i18n,component.value,this.i18nId+'.'+component.suffix),
				this.getHtmlControlMessageForValue(i18n,component.value.speed,this.i18nId+'.'+component.suffix+'.speed')
			)
		})
		return a.e()
	}
	getHtmlInputLines(i18n) {
		const a=Lines.ba(super.getHtmlInputLines(i18n))
		const writeInput=(v,opName,htmlName)=>{
			if (v.input!='slider') return
			const fmtAttrs=formatNumbers.html({min:v.min,max:v.max,value:v.value},v.precision)
			const fmtLabels=formatNumbers({min:v.min,max:v.max},v.precision)
			const minMax=n=>i18n.numberWithUnits(n,v.unit,(a,e)=>Lines.html`<abbr title=${e}>`+a+`</abbr>`)
			a(
				"<div>",
				Lines.html`	<label for=${htmlName}>${i18n(opName)}</label>`,
				"	<span class=min>"+minMax(fmtLabels.min)+"</span>",
				Lines.html`	<input type=range id=${htmlName} min=${fmtAttrs.min} max=${fmtAttrs.max} value=${fmtAttrs.value} step=any />`,
				"	<span class=max>"+minMax(fmtLabels.max)+"</span>",
				"</div>"
			)
		}
		this.components.forEach(component=>{
			writeInput(
				component.value,
				'options.'+this.i18nId+'.'+component.suffix,
				component.name
			)
			writeInput(
				component.value.speed,
				'options.'+this.i18nId+'.'+component.suffix+'.speed',
				component.name+'.speed'
			)
		})
		return a.e()
	}
	getJsInitLines(featureContext) {
		const getSliderListenerLines=(doUpdate)=>{
			const getManyListenersLines=()=>{
				const a=JsLines.b()
				const writeListener=(v,htmlName)=>{
					if (v.input!='slider') return
					const listener=new Listener.Slider(htmlName)
					const entry=listener.enter()
					entry.log("console.log(this.id,'input value:',parseFloat(this.value));")
					if (doUpdate) {
						entry.post(this.updateFnName+"();")
					}
					a(featureContext.getListenerLines(listener))
				}
				this.components.forEach(component=>{
					writeListener(component.value,component.name)
					writeListener(component.value.speed,component.name+'.speed')
				})
				return a.e()
			}
			const getOneListenerLines=()=>{
				const listener=new Listener.MultipleSlider("[id^=\""+this.name+".\"]") // will also handle speed sliders, but it's ok
				const entry=listener.enter()
				entry.log("console.log(this.id,'input value:',parseFloat(this.value));")
				if (doUpdate) {
					entry.post(this.updateFnName+"();")
				}
				return featureContext.getListenerLines(listener)
			}
			const manyListenersLines=getManyListenersLines()
			const oneListenerLines=getOneListenerLines()
			return manyListenersLines.count()<=oneListenerLines.count() ? manyListenersLines : oneListenerLines
		}
		const a=JsLines.ba(super.getJsInitLines(featureContext))
		a(this.getJsDeclarationLines())
		if (this.modeConstant) {
			a(this.getJsUpdateLines(this.makeInitialComponentValue()))
			return a.e()
		}
		const someSpeeds=this.components.some(component=>component.hasSpeed())
		const someValueSliders=this.components.some(component=>component.value.input=='slider')
		const someGamepads=this.components.some(component=>component.hasInputClass(Input.Gamepad))
		const writeVarLines=()=>{
			let fmt, sfmt
			const numbers={}, snumbers={}
			const writes=[], swrites=[]
			this.components.forEach(component=>{
				if (
					(component.value.input instanceof Input.MouseMove && (someValueSliders || someSpeeds || someGamepads)) || // mouse input required elsewhere
					(component.value.speed.input!='constant' && component.value.input!='slider') // variable speed and no value input capable of storing the state
				) {
					numbers[component.value.name]=component.value
					writes.push(component)
				}
				if (component.value.speed.input instanceof Input.MouseMove) {
					snumbers[component.value.name]=component.value.speed
					swrites.push(component)
				}
			})
			fmt=formatNumbers.js(numbers)
			sfmt=formatNumbers.js(snumbers)
			writes.forEach(component=>a("var "+component.varName+"="+fmt[component.value.name]+";"))
			swrites.forEach(component=>a("var "+component.varNameSpeed+"="+sfmt[component.value.name]+";"))
		}
		writeVarLines()
		if (!someSpeeds && someValueSliders && !someGamepads) {
			a(
				WrapLines.b(
					JsLines.bae("function "+this.updateFnName+"() {"),
					JsLines.bae("}")
				).ae(
					this.getJsUpdateLines(this.makeUpdatedComponentValue())
				),
				this.updateFnName+"();"
			)
		}
		a(getSliderListenerLines(!someSpeeds && !someGamepads))
		if (this.components.some(component=>(component.value.input instanceof Input.MouseMove))) {
			if (!someSpeeds && !someValueSliders && !someGamepads) {
				a(this.getJsUpdateLines(this.makeInitialComponentValue()))
			}
			const entry=featureContext.canvasMousemoveListener.enter()
			this.components.forEach(component=>{
				if (component.value.input instanceof Input.MouseMove) {
					const fmt=formatNumbers.js({
						min:component.value.min,
						max:component.value.max,
					},component.value.precision)
					;((!someSpeeds && !someValueSliders && !someGamepads) ? entry.minMaxVarFloat : entry.minMaxFloat)(
						component.value.input,component.varName,fmt.min,fmt.max
					)
					entry.log("console.log('"+component.name+" input value:',"+component.varName+");")
					if (!someSpeeds && !someValueSliders && !someGamepads) {
						this.addPostToListenerEntryForComponent(entry,component)
					}
				}
			})
			if (!someSpeeds && !someGamepads) {
				if (!someValueSliders) {
					this.addPostToListenerEntryAfterComponents(entry,this.makeUpdatedComponentValue())
				} else {
					entry.post(this.updateFnName+"();")
				}
			}
		}
		if (this.components.some(component=>(component.value.speed.input instanceof Input.MouseMove))) {
			const entry=featureContext.canvasMousemoveListener.enter()
			this.components.forEach(component=>{
				const fmt=formatNumbers.js({
					min:component.value.speed.min,
					max:component.value.speed.max,
				},component.value.speed.precision)
				if (component.value.speed.input instanceof Input.MouseMove) {
					entry.minMaxFloat(component.value.speed.input,component.varNameSpeed,fmt.min,fmt.max)
						.log("console.log('"+component.name+".speed input value:',"+component.varNameSpeed+");")
				}
			})
		}
		return a.e()
	}
	getJsLoopLines(featureContext) {
		const a=JsLines.ba(super.getJsLoopLines(featureContext))
		const add=(s)=>{
			const c=s.charAt(0)
			if (c=='-' || c=='+') {
				return s
			} else {
				return "+"+s
			}
		}
		let needUpdate=false
		const writeGamepad=(component,v,dotSuffix,varSuffix)=>{
			if (v.input instanceof Input.Gamepad) {
				needUpdate=true
				const fmt=formatNumbers.js({min:v.min,max:v.max,value:v.value},v.precision)
				a(
					"var "+component.minVarName+varSuffix+"="+fmt.min+";",
					"var "+component.maxVarName+varSuffix+"="+fmt.max+";",
					"var "+component.varName+varSuffix+"="+fmt.value+";",
					"if (gamepad && gamepad.axes.length>"+v.input.axis+") {",
					"	"+component.varName+varSuffix+"="+component.minVarName+varSuffix+"+("+component.maxVarName+varSuffix+"-"+component.minVarName+varSuffix+")*(gamepad.axes["+v.input.axis+"]+1)/2;",
					"}"
				)
				if (featureContext && featureContext.debugOptions.inputs) { // TODO always pass featureContext
					a("console.log('"+component.name+dotSuffix+" input value:',"+component.varName+varSuffix+");")
				}
			}
		}
		this.components.forEach(component=>{
			const v=component.value
			writeGamepad(component,v,'','')
			writeGamepad(component,v.speed,'.speed','Speed')
			if (component.hasSpeed()) {
				needUpdate=true
				let addSpeed
				if (v.speed.input=='slider') {
					addSpeed="+parseFloat(document.getElementById('"+component.name+".speed').value)"
				} else if (v.speed.input instanceof Input.MouseMove || v.speed.input instanceof Input.Gamepad) {
					addSpeed="+"+component.varNameSpeed
				} else {
					addSpeed=add(formatNumber.js(v.speed))
				}
				let limitFn=(x,dx)=>{
					if (x==component.varName) {
						return dx.charAt(0)+"="+dx.slice(1)
					} else {
						return "="+x+dx
					}
				}
				if (component.wrapped) {
					limitFn=(x,dx)=>"=wrap("+x+dx+","+formatNumber.js(v.max,v.precision)+")"
				} else if (component.clamped) {
					const fmt=formatNumbers.js({min:v.min,max:v.max},v.precision)
					limitFn=(x,dx)=>"=clamp("+x+dx+","+fmt.min+","+fmt.max+")"
				} else if (component.capped) {
					limitFn=(x,dx)=>"=Math."+(v.speed<0?"max":"min")+"("+x+dx+","+formatNumber.js(v.speed<0?v.min:v.max,v.precision)+")"
				}
				const incrementLine=(base,dt)=>component.varName+limitFn(base,addSpeed+"*"+dt+"/1000")+";"
				if (v.input=='slider') {
					a(
						"var "+component.varNameInput+"=document.getElementById('"+component.name+"');",
						"var "+incrementLine("parseFloat("+component.varNameInput+".value)","(time-prevTime)"),
						component.varNameInput+".value="+component.varName+";"
					)
				} else if (v.input instanceof Input.MouseMove || v.speed.input!='constant') {
					a(incrementLine(component.varName,"(time-prevTime)"))
				} else {
					a("var "+incrementLine(formatNumber.js(v),"(time-startTime)"))
				}
				if (featureContext && featureContext.debugOptions.animations) { // TODO always pass featureContext
					a("console.log('"+component.name+" animation value:',"+component.varName+");")
				}
			}
		})
		if (needUpdate) {
			a(this.getJsUpdateLines(this.makeUpdatedComponentValue()))
		}
		return a.e()
	}
}

module.exports=Vector
