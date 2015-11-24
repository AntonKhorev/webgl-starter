var Lines=require('../lines.js');
var Mesh=require('./mesh.js');

var Terrain=function(elementIndexBits,shaderType,lod){
	Mesh.call(this,elementIndexBits,shaderType,lod);
};
Terrain.prototype=Object.create(Mesh.prototype);
Terrain.prototype.constructor=Terrain;
Terrain.prototype.getDistinctVertexCount=function(lodSymbol){
	return "Math.pow((1<<"+lodSymbol+")+1,2)";
};
Terrain.prototype.getTotalVertexCount=function(lodSymbol){
	return "Math.pow((1<<"+lodSymbol+"),2)*6";
};
Terrain.prototype.writeMeshInit=function(){
	var lines=new Lines;
	lines.a(
		"var xyRange=1/Math.sqrt(2);",
		"var zRange=xyRange;",
		"var mask=res-1;",
		"function zOffset(i,j) {",
		"	return vertexElement(i,j"+(this.shaderType!='face'?"":",0")+")*"+this.getNumbersPerVertex()+"+2;",
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
	);
	if (this.shaderType!='face') {
		lines.a(
			"for (i0=0;i0<res;i0++) vertices[zOffset(i0,res)]=vertices[zOffset(i0,0)];",
			"for (j0=0;j0<res;j0++) vertices[zOffset(res,j0)]=vertices[zOffset(0,j0)];",
			"vertices[zOffset(res,res)]=vertices[zOffset(0,0)];"
		);
	}
	return lines;
};
Terrain.prototype.writeMeshVertex=function(c,cv){
	var lines=new Lines;
	lines.a(
		"vertices[vertexOffset+0]=x;",
		"vertices[vertexOffset+1]=y;",
		(this.shaderType!='face'
			?"// vertices[vertexOffset+2] already written"
			:"vertices[vertexOffset+2]=vertices[zOffset((i+di)&mask,(j+dj)&mask)];"
		)
	);
	if (this.getNumbersPerNormal()) {
		lines.a(
			"var d=4*xyRange/res;",
			"var normal=normalize([",
			(this.shaderType!='face'
				?"	(vertices[zOffset(i,(j-1)&mask)]-vertices[zOffset(i,(j+1)&mask)])/d,"
				:"	(vertices[zOffset((i+di)&mask,(j+dj-1)&mask)]-vertices[zOffset((i+di)&mask,(j+dj+1)&mask)])/d,"
			),
			(this.shaderType!='face'
				?"	(vertices[zOffset((i-1)&mask,j)]-vertices[zOffset((i+1)&mask,j)])/d,"
				:"	(vertices[zOffset((i+di-1)&mask,(j+dj)&mask)]-vertices[zOffset((i+di+1)&mask,(j+dj)&mask)])/d,"
			),
			"1]);",
			"vertices[vertexOffset+3]=normal[0];",
			"vertices[vertexOffset+4]=normal[1];",
			"vertices[vertexOffset+5]=normal[2];"
		);
	} else if (c) {
		lines.a(
			"var ic=(i&1)*2+(j&1);",
			"vertices[vertexOffset+3]=colors[ic][0];",
			"vertices[vertexOffset+4]=colors[ic][1];",
			"vertices[vertexOffset+5]=colors[ic][2];"
		);
	}
	return lines;
};

module.exports=Terrain;
