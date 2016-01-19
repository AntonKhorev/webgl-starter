'use strict';

const Lines=require('./lines.js');
const Feature=require('./feature.js');
const CallVector=require('./call-vector.js');

class Background extends Feature {
	constructor(options) {
		super();
		this.isSolid=(options.type=='solid');
		if (this.isSolid) {
			this.features.push(
				new CallVector('background.color',options.color.entries,'gl.clearColor',[0,0,0,0])
			);
		}
	}
	getJsLoopLines(featureContext) {
		const lines=super.getJsLoopLines(featureContext);
		if (this.isSolid) {
			lines.a(
				"gl.clear(gl.COLOR_BUFFER_BIT);"
			);
		}
		return lines;
	}
}

module.exports=Background;
