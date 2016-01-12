'use strict';

const Lines=require('./lines.js');
const Feature=require('./feature.js');

class Canvas extends Feature {
	constructor(options) {
		super();
		this.options=options;
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
