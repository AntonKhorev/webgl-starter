'use strict';

const Lines=require('../lines.js');
const Colorgen=require('../colorgen.js');
const Shape=require('./shape.js');

class Triangle extends Shape {
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
			"var nVertices=3;",
			"var vertices=new Float32Array([",
			"	//                   x                      y"+colorgen.getHeaderString(),
			"	-Math.sin(0/3*Math.PI), Math.cos(0/3*Math.PI),"+writeColorData(),
			"	-Math.sin(2/3*Math.PI), Math.cos(2/3*Math.PI),"+writeColorData(),
			"	-Math.sin(4/3*Math.PI), Math.cos(4/3*Math.PI),"+writeColorData(),
			"]);"
		);
		if (this.usesElements()) {
			lines.a(
				"var nElements=3;",
				"var elements=new "+this.getElementIndexJsArray()+"([0,1,2]);"
			);
		}
		return lines;
	}
}

module.exports=Triangle;
