'use strict'

const JsLines=require('crnx-base/lines')
const Mesh=require('./mesh')

class Hat extends Mesh {
	writeMeshInit() {
		return JsLines.bae(
			"var xyRange=4;",
			"var xyScale=1/(4*Math.sqrt(2));"
		)
	}
	writeMeshVertex() {
		const a=JsLines.b()
		let iv=0
		a(
			"var r2=(x*x+y*y)/2;",
			"var A=Math.exp(-r2)/Math.PI;",
			"var z=A*(1-r2);",
			"vertices[vertexOffset+"+(iv++)+"]=x*xyScale;",
			"vertices[vertexOffset+"+(iv++)+"]=y*xyScale;",
			"vertices[vertexOffset+"+(iv++)+"]=z;"
		)
		if (this.hasNormals) {
			a(
				"var normal=normalize([(z+A)*x/xyScale,(z+A)*y/xyScale,1]);",
				"vertices[vertexOffset+"+(iv++)+"]=normal[0];",
				"vertices[vertexOffset+"+(iv++)+"]=normal[1];",
				"vertices[vertexOffset+"+(iv++)+"]=normal[2];"
			)
		}
		a(this.writeMeshVertexColors(iv))
		return a.e()
	}
}

module.exports=Hat
