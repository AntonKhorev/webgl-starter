var Lines=require('../lines.js');
var Mesh=require('./mesh.js');

var Hat=function(elementIndexBits,shaderType,lod){
	Mesh.call(this,elementIndexBits,shaderType,lod);
};
Hat.prototype=Object.create(Mesh.prototype);
Hat.prototype.constructor=Hat;
Hat.prototype.writeMeshInit=function(){
	return new Lines(
		"var xyRange=4;",
		"var xyScale=1/(4*Math.sqrt(2));"
	);
};
Hat.prototype.writeMeshVertex=function(c,cv){
	var lines=new Lines;
	lines.a(
		"var r2=(x*x+y*y)/2;",
		"var A=Math.exp(-r2)/Math.PI;",
		"var z=A*(1-r2);",
		"vertices[vertexOffset+0]=x*xyScale;",
		"vertices[vertexOffset+1]=y*xyScale;",
		"vertices[vertexOffset+2]=z;"
	);
	if (this.getNumbersPerNormal()) {
		lines.a(
			"var normal=normalize([(z+A)*x/xyScale,(z+A)*y/xyScale,1]);",
			"vertices[vertexOffset+3]=normal[0];",
			"vertices[vertexOffset+4]=normal[1];",
			"vertices[vertexOffset+5]=normal[2];"
		);
	} else if (c) {
		if (!this.usesElements() && this.shaderType!='face') {
			lines.a(
				"var ic=((i+di)&1)*2+((j+dj)&1);"
			);
		} else {
			lines.a(
				"var ic=(i&1)*2+(j&1);"
			);
		}
		lines.a(
			"vertices[vertexOffset+3]=colors[ic][0];",
			"vertices[vertexOffset+4]=colors[ic][1];",
			"vertices[vertexOffset+5]=colors[ic][2];"
		);
	}
	return lines;
};

module.exports=Hat;
