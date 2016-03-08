'use strict'

const JsLines=require('crnx-base/js-lines')
const IndentLines=require('crnx-base/indent-lines')
const LodShape=require('./lodshape')

class Mesh extends LodShape {
	get dim() { return 3 }
	getDistinctVertexCount(lodSymbol) {
		return "Math.pow((1<<"+lodSymbol+")+1,2)"
	}
	getFaceVertexCount(lodSymbol) {
		return "Math.pow((1<<"+lodSymbol+"),2)*4"
	}
	getTotalVertexCount(lodSymbol) {
		return "Math.pow((1<<"+lodSymbol+"),2)*6"
	}
	writeMeshVertexColors(iv) {
		if (this.hasColorsPerVertex || this.hasColorsPerFace) {
			return JsLines.bae(
				((!this.usesElements() && !this.hasColorsPerFace)
					?"var ic=((i+di)&1)*2+((j+dj)&1);"
					:"var ic=(i&1)*2+(j&1);"
				),
				"colors[ic].forEach(function(cc,icc){",
				"	vertices[vertexOffset+"+iv+"+icc]=cc;",
				"});"
			)
		} else {
			return JsLines.be()
		}
	}
	// abstract writeMeshInit() {}
	// abstract writeMeshVertex() {}
	writeStoreShape() {
		const a=JsLines.b()
		a("var res=(1<<shapeLod);")
		if (!this.usesElements()) {
			a(
				"function vertexElement(i,j,k) {",
				"	return (i*res+j)*6+k;",
				"}"
			)
		} else if (this.hasColorsPerFace) {
			a(
				"function vertexElement(i,j,k) {",
				"	return (i*res+j)*4+k;",
				"}"
			)
		} else {
			a(
				"function vertexElement(i,j) {",
				"	return i*(res+1)+j;",
				"}"
			)
		}
		if (this.hasNormals) {
			a(
				"function normalize(v) {",
				"	var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);",
				"	return [v[0]/l,v[1]/l,v[2]/l];",
				"}"
			)
		}
		if (this.hasColorsPerVertex || this.hasColorsPerFace) {
			a(this.writeColorData())
		}
		a(this.writeMeshInit())
		if (!this.usesElements()) {
			a(
				"for (var i=0;i<res;i++) {",
				"	for (var j=0;j<res;j++) {",
				"		for (var k=0;k<6;k++) {",
				"			var di=[0,0,1,1,0,1][k];",
				"			var dj=[0,1,0,0,1,1][k];",
				"			var y=(i+di)/res*xyRange*2-xyRange;",
				"			var x=(j+dj)/res*xyRange*2-xyRange;",
				"			var vertexOffset=vertexElement(i,j,k)*"+this.getNumbersPerVertex()+";",
				IndentLines.b(3).ae(this.writeMeshVertex()),
				"		}",
				"	}",
				"}"
			)
		} else if (this.hasColorsPerFace) {
			a(
				"var i,j;",
				"for (i=0;i<res;i++) {",
				"	for (j=0;j<res;j++) {",
				"		for (var k=0;k<4;k++) {",
				"			var di=[0,0,1,1][k];",
				"			var dj=[0,1,0,1][k];",
				"			var y=(i+di)/res*xyRange*2-xyRange;",
				"			var x=(j+dj)/res*xyRange*2-xyRange;",
				"			var vertexOffset=vertexElement(i,j,k)*"+this.getNumbersPerVertex()+";",
				IndentLines.b(3).ae(this.writeMeshVertex()),
				"		}",
				"	}",
				"}",
				"for (i=0;i<res;i++) {",
				"	for (j=0;j<res;j++) {",
				"		var elementOffset=(i*res+j)*6;",
				"		elements[elementOffset+0]=vertexElement(i,j,0);",
				"		elements[elementOffset+1]=vertexElement(i,j,1);",
				"		elements[elementOffset+2]=vertexElement(i,j,2);",
				"		elements[elementOffset+3]=vertexElement(i,j,2);",
				"		elements[elementOffset+4]=vertexElement(i,j,1);",
				"		elements[elementOffset+5]=vertexElement(i,j,3);",
				"	}",
				"}"
			)
		} else {
			a(
				"var i,j;",
				"for (i=0;i<=res;i++) {",
				"	var y=i/res*xyRange*2-xyRange;",
				"	for (j=0;j<=res;j++) {",
				"		var x=j/res*xyRange*2-xyRange;",
				"		var vertexOffset=vertexElement(i,j)*"+this.getNumbersPerVertex()+";",
				IndentLines.b(2).ae(this.writeMeshVertex()),
				"	}",
				"}",
				"for (i=0;i<res;i++) {",
				"	for (j=0;j<res;j++) {",
				"		var elementOffset=(i*res+j)*6;",
				"		elements[elementOffset+0]=vertexElement(i+0,j+0);",
				"		elements[elementOffset+1]=vertexElement(i+0,j+1);",
				"		elements[elementOffset+2]=vertexElement(i+1,j+0);",
				"		elements[elementOffset+3]=vertexElement(i+1,j+0);",
				"		elements[elementOffset+4]=vertexElement(i+0,j+1);",
				"		elements[elementOffset+5]=vertexElement(i+1,j+1);",
				"	}",
				"}"
			)
		}
		return a.e()
	}
}

module.exports=Mesh
