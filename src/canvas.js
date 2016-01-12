'use strict';

const Lines=require('./lines.js');
const Feature=require('./feature.js');
const IntFeature=require('./int-feature.js');

class Canvas extends Feature {
	constructor(options) {
		super();
		this.options=options;
		this.features.push(
			new IntFeature('canvas.width' ,options.width),
			new IntFeature('canvas.height',options.height)
		);
	}
	getHtmlCanvasLines() {
		return new Lines(
			"<div>",
			"	<canvas id='myCanvas' width='"+this.options.width+"' height='"+this.options.height+"'></canvas>",
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
		const needAspectConstant=!this.hasInputs() && Number(this.options.width)!=Number(this.options.height);
		if (needAspectConstant) {
			return new Lines(
				"float aspect="+this.options.width+".0/"+this.options.height+".0;"
			);
		} else {
			return new Lines;
		}
	}
	providesAspect() {
		return this.hasInputs() || Number(this.options.width)!=Number(this.options.height);
	}
}

module.exports=Canvas;
