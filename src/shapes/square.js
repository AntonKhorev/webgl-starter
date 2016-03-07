'use strict'

const JsLines=require('crnx-base/js-lines')
const Colorgen=require('../colorgen')
const Shape=require('./shape')

class Square extends Shape {
	get glPrimitive() { return 'TRIANGLE_FAN' }
	writeArrays() {
		const colorgen=new Colorgen(this.colorAttrs,0)
		let colorDataForFace
		const writeColorData=()=>{
			if (this.hasColorsPerFace && !this.hasColorsPerVertex) {
				if (colorDataForFace===undefined) {
					colorDataForFace=colorgen.getNextColorString()
				}
				return colorDataForFace
			} else {
				return colorgen.getNextColorString()
			}
		}
		const a=JsLines.ba(
			"var nVertices=4;",
			"var vertices=new Float32Array([",
			"	// x    y"+colorgen.getHeaderString(),
			"	-0.5,-0.5,"+writeColorData(),
			"	+0.5,-0.5,"+writeColorData(),
			"	+0.5,+0.5,"+writeColorData(),
			"	-0.5,+0.5,"+writeColorData(),
			"]);"
		)
		if (this.usesElements()) {
			a(
				"var nElements=4;",
				"var elements=new "+this.getElementIndexJsArray()+"([0,1,2,3]);"
			)
		}
		return a.e()
	}
}

module.exports=Square
