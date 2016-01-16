'use strict';

const Listener=require('./listener-classes.js');

class FeatureContext {
	constructor(debugOptions) {
		this.debugOptions=debugOptions;
		this.canvasMousemoveListener=new Listener.CanvasMousemove();
		//// to be set by features:
		// for html:
		this.hasSliders=false;
		// for js:
		this.hasInputs=false; // must have renderFrame()
		this.hasStartTime=false;
		this.hasPrevTime=false;
		this.pollsGamepad=false;
		this.hasClampFn=false;
		this.hasWrapFn=false;
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
	getListenerLines(listener) {
		return listener.write(!this.isAnimated,this.debugOptions.inputs);
	}
}

module.exports=FeatureContext;
