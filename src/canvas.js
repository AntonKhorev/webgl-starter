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
}

module.exports=Canvas;
