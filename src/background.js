'use strict'

const JsLines=require('crnx-base/js-lines')
const Feature=require('./feature')
const CallVector=require('./call-vector')

class Background extends Feature {
	constructor(options) {
		super()
		this.isSolid=(options.type=='solid')
		if (this.isSolid) {
			this.features.push(
				new CallVector('background.color',options.color.entries,'gl.clearColor',[0,0,0,0])
			)
		}
	}
	getJsLoopLines(featureContext) {
		const a=JsLines.ba(super.getJsLoopLines(featureContext))
		if (this.isSolid) {
			a("gl.clear(gl.COLOR_BUFFER_BIT);")
		}
		return a.e()
	}
}

module.exports=Background
