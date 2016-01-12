'use strict';

const listeners=require('./listeners.js');

class FeatureContext {
	constructor(debugOptions) {
		this.debugOptions=debugOptions;
		this.canvasMousemoveListener=new listeners.CanvasMousemoveListener();
		//// to be set by features:
		// for html:
		this.hasSliders=false;
		// for js:
		this.hasStartTime=false;
		this.hasPrevTime=false;
		this.pollsGamepad=false;
	}
	get isAnimated() {
		return this.hasStartTime || this.hasPrevTime || this.pollsGamepad;
	}
	getJsAfterInitLines() {
		return this.canvasMousemoveListener.write(!this.isAnimated,this.debugOptions.inputs);
	}
}

module.exports=FeatureContext;
