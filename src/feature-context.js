'use strict';

const listeners=require('./listeners.js');

class FeatureContext {
	constructor(haveToLogInput) {
		this.haveToLogInput=haveToLogInput;
		this.canvasMousemoveListener=new listeners.CanvasMousemoveListener();
		// to be set by faetures:
		this.hasStartTime=false;
		this.hasPrevTime=false;
		this.pollsGamepad=false;
	}
	get isAnimated() {
		return this.hasStartTime || this.hasPrevTime || this.pollsGamepad;
	}
	getJsAfterInitLines() {
		return this.canvasMousemoveListener.write(!this.isAnimated,this.haveToLogInput);
	}
}

module.exports=FeatureContext;
