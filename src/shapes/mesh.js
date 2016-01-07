var Lines=require('../lines.js');
var LodShape=require('./lodshape.js');

var Mesh=function(options,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs){
	LodShape.apply(this,arguments);
};
Mesh.prototype=Object.create(LodShape.prototype);
Mesh.prototype.constructor=Mesh;
Mesh.prototype.dim=3;
Mesh.prototype.getDistinctVertexCount=function(lodSymbol){
	return "Math.pow((1<<"+lodSymbol+")+1,2)";
};
Mesh.prototype.getFaceVertexCount=function(lodSymbol){
	return "Math.pow((1<<"+lodSymbol+"),2)*4";
};
Mesh.prototype.getTotalVertexCount=function(lodSymbol){
	return "Math.pow((1<<"+lodSymbol+"),2)*6";
};
Mesh.prototype.writeMeshVertexColors=function(iv){
	if (this.hasColorsPerVertex || this.hasColorsPerFace) {
		return new Lines(
			((!this.usesElements() && !this.hasColorsPerFace)
				?"var ic=((i+di)&1)*2+((j+dj)&1);"
				:"var ic=(i&1)*2+(j&1);"
			),
			"colors[ic].forEach(function(cc,icc){",
			"	vertices[vertexOffset+"+iv+"+icc]=cc;",
			"});"
		);
	} else {
		return new Lines;
	}
};
// abstract Mesh.prototype.writeMeshInit=function(){};
// abstract Mesh.prototype.writeMeshVertex=function(){};
Mesh.prototype.writeStoreShape=function(){
	var lines=new Lines;
	lines.a(
		"var res=(1<<shapeLod);"
	);
	if (!this.usesElements()) {
		lines.a(
			"function vertexElement(i,j,k) {",
			"	return (i*res+j)*6+k;",
			"}"
		);
	} else if (this.hasColorsPerFace) {
		lines.a(
			"function vertexElement(i,j,k) {",
			"	return (i*res+j)*4+k;",
			"}"
		);
	} else {
		lines.a(
			"function vertexElement(i,j) {",
			"	return i*(res+1)+j;",
			"}"
		);
	}
	if (this.hasNormals) {
		lines.a(
			"function normalize(v) {",
			"	var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);",
			"	return [v[0]/l,v[1]/l,v[2]/l];",
			"}"
		);
	}
	if (this.hasColorsPerVertex || this.hasColorsPerFace) {
		lines.a(this.writeColorData());
	}
	lines.a(
		this.writeMeshInit()
	);
	if (!this.usesElements()) {
		lines.a(
			"for (var i=0;i<res;i++) {",
			"	for (var j=0;j<res;j++) {",
			"		for (var k=0;k<6;k++) {",
			"			var di=[0,0,1,1,0,1][k];",
			"			var dj=[0,1,0,0,1,1][k];",
			"			var y=(i+di)/res*xyRange*2-xyRange;",
			"			var x=(j+dj)/res*xyRange*2-xyRange;",
			"			var vertexOffset=vertexElement(i,j,k)*"+this.getNumbersPerVertex()+";",
			this.writeMeshVertex().indent(3),
			"		}",
			"	}",
			"}"
		);
	} else if (this.hasColorsPerFace) {
		lines.a(
			"var i,j;",
			"for (i=0;i<res;i++) {",
			"	for (j=0;j<res;j++) {",
			"		for (var k=0;k<4;k++) {",
			"			var di=[0,0,1,1][k];",
			"			var dj=[0,1,0,1][k];",
			"			var y=(i+di)/res*xyRange*2-xyRange;",
			"			var x=(j+dj)/res*xyRange*2-xyRange;",
			"			var vertexOffset=vertexElement(i,j,k)*"+this.getNumbersPerVertex()+";",
			this.writeMeshVertex().indent(3),
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
		);
	} else {
		lines.a(
			"var i,j;",
			"for (i=0;i<=res;i++) {",
			"	var y=i/res*xyRange*2-xyRange;",
			"	for (j=0;j<=res;j++) {",
			"		var x=j/res*xyRange*2-xyRange;",
			"		var vertexOffset=vertexElement(i,j)*"+this.getNumbersPerVertex()+";",
			this.writeMeshVertex().indent(2),
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
		);
	}
	return lines;
};

module.exports=Mesh;
