'use strict'

const JsLines=require('crnx-base/js-lines')
const Mesh=require('./mesh')

class Terrain extends Mesh {
	writeMeshInit() {
		const noFaces=(this.usesElements() && !this.hasColorsPerFace)
		const a=JsLines.b()
		a(
			"var xyRange=1/Math.sqrt(2);",
			"var zRange=xyRange;",
			"var mask=res-1;",
			"function zOffset(i,j) {",
			"	return vertexElement(i,j"+(noFaces?"":",0")+")*"+this.getNumbersPerVertex()+"+2;",
			"}",
			"function noise(depth) {",
			"	var r=zRange/Math.pow(2,shapeLod-depth-1);",
			"	return Math.random()*2*r-r;",
			"}",
			"vertices[2]=0.0;",
			"var i0,i1,i2,i3;",
			"var j0,j1,j2,j3;",
			"for (var depth=shapeLod-1;depth>=0;depth--) {",
			"	var d=1<<depth;",
			"	// diamond step",
			"	for (i2=d;i2<res;i2+=2*d) {",
			"		for (j2=d;j2<res;j2+=2*d) {",
			"			i1=i2-d;",
			"			j1=j2-d;",
			"			i3=(i2+d)&mask;",
			"			j3=(j2+d)&mask;",
			"			vertices[zOffset(i2,j2)]=(",
			"				vertices[zOffset(i1,j1)]+vertices[zOffset(i1,j3)]+",
			"				vertices[zOffset(i3,j1)]+vertices[zOffset(i3,j3)]",
			"			)/4+noise(depth);",
			"		}",
			"	}",
			"	// square step",
			"	for (i2=d;i2<res;i2+=2*d) {",
			"		for (j2=d;j2<res;j2+=2*d) {",
			"			i0=(i2-2*d)&mask;",
			"			j0=(j2-2*d)&mask;",
			"			i1=(i2-d);",
			"			j1=(j2-d);",
			"			i3=(i2+d)&mask;",
			"			j3=(j2+d)&mask;",
			"			vertices[zOffset(i2,j1)]=(",
			"				vertices[zOffset(i2,j0)]+vertices[zOffset(i1,j1)]+",
			"				vertices[zOffset(i2,j2)]+vertices[zOffset(i3,j1)]",
			"			)/4+noise(depth);",
			"			vertices[zOffset(i1,j2)]=(",
			"				vertices[zOffset(i0,j2)]+vertices[zOffset(i1,j1)]+",
			"				vertices[zOffset(i2,j2)]+vertices[zOffset(i1,j3)]",
			"			)/4+noise(depth);",
			"		}",
			"	}",
			"}"
		)
		if (noFaces) {
			a(
				"for (i0=0;i0<res;i0++) vertices[zOffset(i0,res)]=vertices[zOffset(i0,0)];",
				"for (j0=0;j0<res;j0++) vertices[zOffset(res,j0)]=vertices[zOffset(0,j0)];",
				"vertices[zOffset(res,res)]=vertices[zOffset(0,0)];"
			)
		}
		return a.e()
	}
	writeMeshVertex() {
		const noFaces=(this.usesElements() && !this.hasColorsPerFace)
		const a=JsLines.b()
		a(
			"vertices[vertexOffset+0]=x;",
			"vertices[vertexOffset+1]=y;",
			(noFaces
				?"// vertices[vertexOffset+2] already written"
				:"vertices[vertexOffset+2]=vertices[zOffset((i+di)&mask,(j+dj)&mask)];"
			)
		)
		let iv=3
		if (this.hasNormals) {
			a(
				"var d=4*xyRange/res;",
				"var normal=normalize([",
				(noFaces
					?"	(vertices[zOffset(i,(j-1)&mask)]-vertices[zOffset(i,(j+1)&mask)])/d,"
					:"	(vertices[zOffset((i+di)&mask,(j+dj-1)&mask)]-vertices[zOffset((i+di)&mask,(j+dj+1)&mask)])/d,"
				),
				(noFaces
					?"	(vertices[zOffset((i-1)&mask,j)]-vertices[zOffset((i+1)&mask,j)])/d,"
					:"	(vertices[zOffset((i+di-1)&mask,(j+dj)&mask)]-vertices[zOffset((i+di+1)&mask,(j+dj)&mask)])/d,"
				),
				"1]);",
				"vertices[vertexOffset+"+(iv++)+"]=normal[0];",
				"vertices[vertexOffset+"+(iv++)+"]=normal[1];",
				"vertices[vertexOffset+"+(iv++)+"]=normal[2];"
			)
		}
		a(this.writeMeshVertexColors(iv))
		return a.e()
	}
}

module.exports=Terrain
