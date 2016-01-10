'use strict';

const Lines=require('./lines.js');
const Feature=require('./feature.js');
const CallVector=require('./call-vector.js');

class Background extends Feature {
	constructor(options) {
		super();
		this.isSolid=(options.type=='solid');
		if (this.isSolid) {
			this.colorVector=new CallVector('backgroundColor',options.color,'gl.clearColor',[0,0,0,0]);
		}
	}
	getJsInitLines() {
		const lines=new Lines;
		if (this.isSolid) {
			lines.a(
				this.colorVector.getJsInitLines()
			);
		}
		return lines;
	}
	getJsLoopLines() {
		const lines=new Lines;
		if (this.isSolid) {
			lines.a(
				this.colorVector.getJsLoopLines(),
				"gl.clear(gl.COLOR_BUFFER_BIT);"
			);
		}
		return lines;
	}
}

module.exports=Background;
