'use strict'

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const Listener=require('./listener-classes')
const Feature=require('./feature')
const IntFeature=require('./int-feature')

class Canvas extends Feature {
	constructor(options) {
		super()
		this.width=options.width
		this.height=options.height
		this.features.push(
			new IntFeature('canvas.width' ,options.width),
			new IntFeature('canvas.height',options.height)
		)
	}
	getHtmlCanvasLines() {
		return Lines.bae(
			"<div>",
			Lines.html`	<canvas id=myCanvas width=${this.width} height=${this.height}></canvas>`,
			"</div>"
		)
	}
	getGlslVertexDeclarationLines() {
		if (this.hasInputs()) {
			return Lines.bae("uniform float aspect;")
		} else {
			return Lines.be()
		}
	}
	getGlslVertexOutputLines() {
		const needAspectConstant=!this.hasInputs() && Number(this.width)!=Number(this.height)
		if (needAspectConstant) {
			return Lines.bae(
				"float aspect="+this.width+".0/"+this.height+".0;"
			)
		} else {
			return Lines.be()
		}
	}
	providesAspect() {
		return this.hasInputs() || Number(this.width)!=Number(this.height)
	}
	getJsInitLines(featureContext) {
		const a=JsLines.ba(super.getJsInitLines(featureContext))
		const canvasUpdater=()=>{
			a(
				"function updateAspect() {",
				"	gl.viewport(0,0,canvas.width,canvas.height);",
				"	gl.uniform1f(aspectLoc,canvas.width/canvas.height);",
				"}",
				"updateAspect();"
			)
		}
		const canvasListener=wh=>{
			if (this[wh].input=='slider') {
				const listener=new Listener.Slider('canvas.'+wh)
				listener.enter()
					.log("console.log(this.id,'input value:',parseInt(this.value));")
					.post("canvas."+wh+"=parseInt(this.value);")
					.post("updateAspect();")
				a(
					featureContext.getListenerLines(listener)
				)
			}
		}
		if (this.hasInputs()) {
			a("var aspectLoc=gl.getUniformLocation(program,'aspect');")
			canvasUpdater()
			canvasListener('width')
			canvasListener('height')
		}
		return a.e()
	}
}

module.exports=Canvas
