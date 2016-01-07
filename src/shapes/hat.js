var Lines=require('../lines.js');
var Mesh=require('./mesh.js');

var Hat=function(options,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs){
	Mesh.apply(this,arguments);
};
Hat.prototype=Object.create(Mesh.prototype);
Hat.prototype.constructor=Hat;
Hat.prototype.writeMeshInit=function(){
	return new Lines(
		"var xyRange=4;",
		"var xyScale=1/(4*Math.sqrt(2));"
	);
};
Hat.prototype.writeMeshVertex=function(){
	var lines=new Lines;
	var iv=0;
	lines.a(
		"var r2=(x*x+y*y)/2;",
		"var A=Math.exp(-r2)/Math.PI;",
		"var z=A*(1-r2);",
		"vertices[vertexOffset+"+(iv++)+"]=x*xyScale;",
		"vertices[vertexOffset+"+(iv++)+"]=y*xyScale;",
		"vertices[vertexOffset+"+(iv++)+"]=z;"
	);
	if (this.hasNormals) {
		lines.a(
			"var normal=normalize([(z+A)*x/xyScale,(z+A)*y/xyScale,1]);",
			"vertices[vertexOffset+"+(iv++)+"]=normal[0];",
			"vertices[vertexOffset+"+(iv++)+"]=normal[1];",
			"vertices[vertexOffset+"+(iv++)+"]=normal[2];"
		);
	}
	lines.a(this.writeMeshVertexColors(iv));
	return lines;
};

module.exports=Hat;
