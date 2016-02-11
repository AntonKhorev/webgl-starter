'use strict';

const Lines=require('crnx-base/lines');
const Listener=require('./listener-classes.js');
const Feature=require('./feature.js');
const IntFeature=require('./int-feature.js');

class Canvas extends Feature {
	constructor(options) {
		super();
		this.width=options.width;
		this.height=options.height;
		this.features.push(
			new IntFeature('canvas.width' ,options.width),
			new IntFeature('canvas.height',options.height)
		);
	}
	getHtmlCanvasLines() {
		return new Lines(
			"<div>",
			"	<canvas id='myCanvas' width='"+this.width+"' height='"+this.height+"'></canvas>",
			"</div>"
		);
	}
	getGlslVertexDeclarationLines() {
		if (this.hasInputs()) {
			return new Lines("uniform float aspect;");
		} else {
			return new Lines;
		}
	}
	getGlslVertexOutputLines() {
		const needAspectConstant=!this.hasInputs() && Number(this.width)!=Number(this.height);
		if (needAspectConstant) {
			return new Lines(
				"float aspect="+this.width+".0/"+this.height+".0;"
			);
		} else {
			return new Lines;
		}
	}
	providesAspect() {
		return this.hasInputs() || Number(this.width)!=Number(this.height);
	}
	getJsInitLines(featureContext) {
		const lines=super.getJsInitLines(featureContext);
		const canvasUpdater=()=>{
			lines.a(
				"function updateAspect() {",
				"	gl.viewport(0,0,canvas.width,canvas.height);",
				"	gl.uniform1f(aspectLoc,canvas.width/canvas.height);",
				"}",
				"updateAspect();"
			);
		};
		const canvasListener=wh=>{
			if (this[wh].input=='slider') {
				const listener=new Listener.Slider('canvas.'+wh);
				listener.enter()
					.log("console.log(this.id,'input value:',parseInt(this.value));")
					.post("canvas."+wh+"=parseInt(this.value);")
					.post("updateAspect();");
				lines.a(
					featureContext.getListenerLines(listener)
				);
			}
		};
		if (this.hasInputs()) {
			lines.a(
				"var aspectLoc=gl.getUniformLocation(program,'aspect');"
			);
			canvasUpdater();
			canvasListener('width');
			canvasListener('height');
		}
		return lines;
	}
}

module.exports=Canvas;
