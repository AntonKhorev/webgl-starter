'use strict';

const Lines=require('../lines.js');
const Colorgen=require('../colorgen.js');
const Shape=require('./shape.js');

class Square extends Shape {
	get glPrimitive() { return 'TRIANGLE_FAN'; }
	writeArrays() {
		const colorgen=new Colorgen(this.colorAttrs,0);
		let colorDataForFace;
		const writeColorData=()=>{
			if (this.hasColorsPerFace && !this.hasColorsPerVertex) {
				if (colorDataForFace===undefined) {
					colorDataForFace=colorgen.getNextColorString();
				}
				return colorDataForFace;
			} else {
				return colorgen.getNextColorString();
			}
		};
		const lines=new Lines(
			"var nVertices=4;",
			"var vertices=new Float32Array([",
			"	// x    y"+colorgen.getHeaderString(),
			"	-0.5,-0.5,"+writeColorData(),
			"	+0.5,-0.5,"+writeColorData(),
			"	+0.5,+0.5,"+writeColorData(),
			"	-0.5,+0.5,"+writeColorData(),
			"]);"
		);
		if (this.usesElements()) {
			lines.a(
				"var nElements=4;",
				"var elements=new "+this.getElementIndexJsArray()+"([0,1,2,3]);"
			);
		}
		return lines;
	}
}

module.exports=Square;
