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
		this.hasInputs=false; // must have renderFrame()
		this.hasStartTime=false;
		this.hasPrevTime=false;
		this.pollsGamepad=false;
	}
	get hasTime() {
		return this.hasStartTime || this.hasPrevTime;
	}
	get isAnimated() {
		return this.hasStartTime || this.hasPrevTime || this.pollsGamepad;
	}
	getJsAfterInitLines() {
		return this.canvasMousemoveListener.write(!this.isAnimated,this.debugOptions.inputs);
	}
}

module.exports=FeatureContext;
