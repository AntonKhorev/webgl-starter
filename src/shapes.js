var Lines=require('./lines.js');
var Shape=require('./shapes/shape.js');
var LodShape=require('./shapes/lodshape.js');
var Mesh=require('./shapes/mesh.js');

var Square=function(elementIndexBits,shaderType){
	Shape.call(this,elementIndexBits,shaderType);
};
Square.prototype=Object.create(Shape.prototype);
Square.prototype.constructor=Square;
Square.prototype.glPrimitive='TRIANGLE_FAN';
Square.prototype.writeArrays=function(c,cv){
	var lines=new Lines(
		"var nVertices=4;",
		"var vertices=new Float32Array([",
		"	// x    y"+(c?   "    r    g    b":""),
		"	-0.5,-0.5,"+(c?cv?" 1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	+0.5,-0.5,"+(c?cv?" 0.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	+0.5,+0.5,"+(c?cv?" 0.0, 0.0, 1.0,":" 1.0, 0.0, 0.0,":""),
		"	-0.5,+0.5,"+(c?cv?" 1.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"]);"
	);
	if (this.usesElements()) {
		lines.a(
			"var nElements=4;",
			"var elements=new "+this.getElementIndexJsArray()+"([0,1,2,3]);"
		);
	}
	return lines;
};

var Triangle=function(elementIndexBits,shaderType){
	Shape.call(this,elementIndexBits,shaderType);
};
Triangle.prototype=Object.create(Shape.prototype);
Triangle.prototype.constructor=Triangle;
Triangle.prototype.writeArrays=function(c,cv){
	var lines=new Lines(
		"var nVertices=3;",
		"var vertices=new Float32Array([",
		"	//                   x                      y"+(c?"    r    g    b":""),
		"	-Math.sin(0/3*Math.PI), Math.cos(0/3*Math.PI),"+(c?cv?" 1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	-Math.sin(2/3*Math.PI), Math.cos(2/3*Math.PI),"+(c?cv?" 0.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	-Math.sin(4/3*Math.PI), Math.cos(4/3*Math.PI),"+(c?cv?" 0.0, 0.0, 1.0,":" 1.0, 0.0, 0.0,":""),
		"]);"
	);
	if (this.usesElements()) {
		lines.a(
			"var nElements=3;",
			"var elements=new "+this.getElementIndexJsArray()+"([0,1,2]);"
		);
	}
	return lines;
};

var Gasket=function(elementIndexBits,shaderType,lod){
	LodShape.call(this,elementIndexBits,shaderType,lod);
};
Gasket.prototype=Object.create(LodShape.prototype);
Gasket.prototype.constructor=Gasket;
Gasket.prototype.getDistinctVertexCount=function(lodSymbol){
	return "(Math.pow(3,"+lodSymbol+"+1)+3)/2";
};
Gasket.prototype.getFaceVertexCount=function(lodSymbol){
	return "Math.pow(3,"+lodSymbol+")*3";
};
Gasket.prototype.getTotalVertexCount=function(lodSymbol){
	return "Math.pow(3,"+lodSymbol+")*3";
};
Gasket.prototype.writeStoreShapeWithElements=function(c,cv){
	function writePushVertex() {
		var lines=new Lines;
		lines.a(
			"vertices[nextIndexIntoVertices++]=p[0];",
			"vertices[nextIndexIntoVertices++]=p[1];"
		);
		if (c) {
			if (this.shaderType=='face') {
				lines.a(
					"var c=colors[nextIndexIntoColors];"
				);
			} else {
				lines.a(
					"var c=colors[nextElement%colors.length];"
				);
			}
			lines.a(
				"vertices[nextIndexIntoVertices++]=c[0];",
				"vertices[nextIndexIntoVertices++]=c[1];",
				"vertices[nextIndexIntoVertices++]=c[2];"
			);
		}
		lines.a(
			"return nextElement++;"
		);
		return lines.wrap(
			"function pushVertex(p) {",
			"}"
		);
	}
	function writeTriangle() {
		var lines=new Lines;
		lines.a(
			"if (depth<=0) {"
		);
		if (this.shaderType=='face') {
			lines.a(
				"	pushElement(pushVertex(p0));",
				"	pushElement(pushVertex(p1));",
				"	pushElement(pushVertex(p2));",
				"	nextIndexIntoColors=(nextIndexIntoColors+1)%colors.length;"
			);
		} else {
			lines.a(
				"	if (es[0]===null) es[0]=pushVertex(p0);",
				"	if (es[1]===null) es[1]=pushVertex(p1);",
				"	if (es[2]===null) es[2]=pushVertex(p2);",
				"	pushElement(es[0]);",
				"	pushElement(es[1]);",
				"	pushElement(es[2]);",
				"	return es;"
			);
		}
		lines.a(
			"} else {",
			"	var p01=mix(p0,p1);",
			"	var p12=mix(p1,p2);",
			"	var p20=mix(p2,p0);"
		);
		if (this.shaderType=='face') {
			lines.a(
				"	var es0=triangle(depth-1,p0,p01,p20);",
				"	var es1=triangle(depth-1,p1,p12,p01);",
				"	var es2=triangle(depth-1,p2,p20,p12);"
			);
		} else {
			lines.a(
				"	var es0=triangle(depth-1,p0,p01,p20,[es[0],null,null]);",
				"	var es1=triangle(depth-1,p1,p12,p01,[es[1],null,es0[1]]);",
				"	var es2=triangle(depth-1,p2,p20,p12,[es[2],es0[2],es1[1]]);",
				"	return [es0[0],es1[0],es2[0]];"
			);
		}
		lines.a(
			"}"
		);
		if (this.shaderType=='face') {
			return lines.wrap(
				"function triangle(depth,p0,p1,p2) {",
				"}"
			);
		} else {
			return lines.wrap(
				"function triangle(depth,p0,p1,p2,es) {",
				"}"
			);
		}
	}
	function writeInitialTriangleCall() {
		var lines=new Lines;
		lines.a(
			"shapeLod,",
			"[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],",
			"[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],",
			"[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]"
		);
		if (this.shaderType!='face') {
			lines.t(
				",","[null,null,null]"
			);
		}
		return lines.wrap(
			"triangle(",
			");"
		);
	}
	var lines=new Lines;
	lines.a(
		"var nextIndexIntoVertices=0;",
		"var nextIndexIntoElements=0;",
		"var nextElement=0;"
	);
	if (c) {
		lines.a(
			"// p = position, c = color, e = element, es = elements",
			"var colors=[",
			"	[1.0, 0.0, 0.0],",
			"	[0.0, 1.0, 0.0],",
			"	[0.0, 0.0, 1.0],",
			"	[1.0, 1.0, 0.0],",
			"];"
		);
		if (this.shaderType=='face') {
			lines.a(
				"var nextIndexIntoColors=0;"
			);
		}
	} else {
		lines.a(
			"// p = position, e = element, es = elements"
		);
	}
	lines.a(
		writePushVertex.call(this),
		"function pushElement(e) {",
		"	elements[nextIndexIntoElements++]=e;",
		"}",
		"function mix(pa,pb) {",
		"	return [",
		"		(pa[0]+pb[0])/2,",
		"		(pa[1]+pb[1])/2,",
		"	];",
		"}",
		writeTriangle.call(this),
		writeInitialTriangleCall.call(this)
	);
	return lines;
}
Gasket.prototype.writeStoreShapeWithoutElements=function(c,cv){
	var lines=new Lines;
	lines.a(
		"var iv=0;"
	);
	if (this.shaderType=='face') {
		lines.a(
			"var ic=0;",
			"var colors=[",
			"	[1.0, 0.0, 0.0],",
			"	[0.0, 1.0, 0.0],",
			"	[0.0, 0.0, 1.0],",
			"	[1.0, 1.0, 0.0],",
			"];"
		);
	}
	if (this.shaderType=='vertex') {
		lines.a(
			"function pushVertex(v,r,g,b) {",
			"	vertices[iv++]=v[0]; vertices[iv++]=v[1];",
			"	vertices[iv++]=r; vertices[iv++]=g; vertices[iv++]=b;",
			"}"
		);
	} else if (this.shaderType=='face') {
		lines.a(
			"function pushVertex(v,c) {",
			"	vertices[iv++]=v[0]; vertices[iv++]=v[1];",
			"	vertices[iv++]=c[0]; vertices[iv++]=c[1]; vertices[iv++]=c[2];",
			"}"
		);
	} else {
		lines.a(
			"function pushVertex(v) {",
			"	vertices[iv++]=v[0]; vertices[iv++]=v[1];",
			"}"
		);
	}
	lines.a(
		"function mix(a,b,m) {",
		"	return [",
		"		a[0]*(1-m)+b[0]*m,",
		"		a[1]*(1-m)+b[1]*m,",
		"	];",
		"}",
		"function triangle(depth,a,b,c) {",
		"	if (depth<=0) {"
	);
	if (this.shaderType=='vertex') {
		lines.a(
			"		pushVertex(a,1.0,0.0,0.0);",
			"		pushVertex(b,0.0,1.0,0.0);",
			"		pushVertex(c,0.0,0.0,1.0);"
		);
	} else if (this.shaderType=='face') {
		lines.a(
			"		pushVertex(a,colors[ic]);",
			"		pushVertex(b,colors[ic]);",
			"		pushVertex(c,colors[ic]);",
			"		ic=(ic+1)%colors.length;"
		);
	} else {
		lines.a(
			"		pushVertex(a);",
			"		pushVertex(b);",
			"		pushVertex(c);"
		);
	}
	lines.a(
		"	} else {",
		"		var ab=mix(a,b,0.5);",
		"		var bc=mix(b,c,0.5);",
		"		var ca=mix(c,a,0.5);",
		"		triangle(depth-1,a,ab,ca);",
		"		triangle(depth-1,b,bc,ab);",
		"		triangle(depth-1,c,ca,bc);",
		"	}",
		"}",
		"triangle(",
		"	shapeLod,",
		"	[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],",
		"	[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],",
		"	[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]",
		");"
	);
	return lines;
};
Gasket.prototype.writeStoreShape=function(c,cv){
	if (this.usesElements()) {
		return this.writeStoreShapeWithElements(c,cv);
	} else {
		return this.writeStoreShapeWithoutElements(c,cv);
	}
};

var Cube=function(elementIndexBits,shaderType){
	Shape.call(this,elementIndexBits,shaderType);
};
Cube.prototype=Object.create(Shape.prototype);
Cube.prototype.constructor=Cube;
Cube.prototype.dim=3;
Cube.prototype.twoSided=false;
Cube.prototype.usesElements=function(){
	return true;
};
Cube.prototype.writeArrays=function(c,cv){
	if (this.shaderType=='face' || this.shaderType=='light') {
		var n=this.shaderType=='light';
		return new Lines(
			"var vertices=new Float32Array([",
			"	// x    y    z "+(n?" n.x  n.y  n.z ":"   r    g    b"),
			"	-0.5,-0.5,-0.5,"+(n?"-1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,")+" // left face",
			"	-0.5,-0.5,+0.5,"+(n?"-1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,"),
			"	-0.5,+0.5,-0.5,"+(n?"-1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,"),
			"	-0.5,+0.5,+0.5,"+(n?"-1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,"),
			"	+0.5,-0.5,-0.5,"+(n?"+1.0, 0.0, 0.0,":" 0.0, 1.0, 0.0,")+" // right face",
			"	+0.5,+0.5,-0.5,"+(n?"+1.0, 0.0, 0.0,":" 0.0, 1.0, 0.0,"),
			"	+0.5,-0.5,+0.5,"+(n?"+1.0, 0.0, 0.0,":" 0.0, 1.0, 0.0,"),
			"	+0.5,+0.5,+0.5,"+(n?"+1.0, 0.0, 0.0,":" 0.0, 1.0, 0.0,"),
			"	-0.5,-0.5,-0.5,"+(n?" 0.0,-1.0, 0.0,":" 1.0, 1.0, 0.0,")+" // bottom face",
			"	+0.5,-0.5,-0.5,"+(n?" 0.0,-1.0, 0.0,":" 1.0, 1.0, 0.0,"),
			"	-0.5,-0.5,+0.5,"+(n?" 0.0,-1.0, 0.0,":" 1.0, 1.0, 0.0,"),
			"	+0.5,-0.5,+0.5,"+(n?" 0.0,-1.0, 0.0,":" 1.0, 1.0, 0.0,"),
			"	-0.5,+0.5,-0.5,"+(n?" 0.0,+1.0, 0.0,":" 0.0, 0.0, 1.0,")+" // top face",
			"	-0.5,+0.5,+0.5,"+(n?" 0.0,+1.0, 0.0,":" 0.0, 0.0, 1.0,"),
			"	+0.5,+0.5,-0.5,"+(n?" 0.0,+1.0, 0.0,":" 0.0, 0.0, 1.0,"),
			"	+0.5,+0.5,+0.5,"+(n?" 0.0,+1.0, 0.0,":" 0.0, 0.0, 1.0,"),
			"	-0.5,-0.5,-0.5,"+(n?" 0.0, 0.0,-1.0,":" 1.0, 0.0, 1.0,")+" // back face",
			"	-0.5,+0.5,-0.5,"+(n?" 0.0, 0.0,-1.0,":" 1.0, 0.0, 1.0,"),
			"	+0.5,-0.5,-0.5,"+(n?" 0.0, 0.0,-1.0,":" 1.0, 0.0, 1.0,"),
			"	+0.5,+0.5,-0.5,"+(n?" 0.0, 0.0,-1.0,":" 1.0, 0.0, 1.0,"),
			"	-0.5,-0.5,+0.5,"+(n?" 0.0, 0.0,+1.0,":" 0.0, 1.0, 1.0,")+" // front face",
			"	+0.5,-0.5,+0.5,"+(n?" 0.0, 0.0,+1.0,":" 0.0, 1.0, 1.0,"),
			"	-0.5,+0.5,+0.5,"+(n?" 0.0, 0.0,+1.0,":" 0.0, 1.0, 1.0,"),
			"	+0.5,+0.5,+0.5,"+(n?" 0.0, 0.0,+1.0,":" 0.0, 1.0, 1.0,"),
			"]);",
			"var nElements=36;",
			"var elements=new "+this.getElementIndexJsArray()+"([",
			"	 0,  1,  2,  2,  1,  3, // left face",
			"	 4,  5,  6,  6,  5,  7, // right face",
			"	 8,  9, 10, 10,  9, 11, // bottom face",
			"	12, 13, 14, 14, 13, 15, // top face",
			"	16, 17, 18, 18, 17, 19, // back face",
			"	20, 21, 22, 22, 21, 23, // front face",
			"]);"
		);
	} else {
		return new Lines(
			"var vertices=new Float32Array([",
			"	// x    y    z"+(c?"    r    g    b":""),
			"	-0.5,-0.5,-0.5,"+(c?" 0.0, 0.0, 0.0,":""),
			"	+0.5,-0.5,-0.5,"+(c?" 1.0, 0.0, 0.0,":""),
			"	-0.5,+0.5,-0.5,"+(c?" 0.0, 1.0, 0.0,":""),
			"	+0.5,+0.5,-0.5,"+(c?" 1.0, 1.0, 0.0,":""),
			"	-0.5,-0.5,+0.5,"+(c?" 0.0, 0.0, 1.0,":""),
			"	+0.5,-0.5,+0.5,"+(c?" 1.0, 0.0, 1.0,":""),
			"	-0.5,+0.5,+0.5,"+(c?" 0.0, 1.0, 1.0,":""),
			"	+0.5,+0.5,+0.5,"+(c?" 1.0, 1.0, 1.0,":""),
			"]);",
			"var nElements=36;",
			"var elements=new "+this.getElementIndexJsArray()+"([",
			"	4, 6, 0, 0, 6, 2, // left face",
			"	1, 3, 5, 5, 3, 7, // right face",
			"	0, 1, 4, 4, 1, 5, // bottom face",
			"	2, 6, 3, 3, 6, 7, // top face",
			"	0, 2, 1, 1, 2, 3, // back face",
			"	5, 7, 4, 4, 7, 6, // front face",
			"]);"
		);
	}
};

var Hat=function(elementIndexBits,shaderType,lod){
	Mesh.call(this,elementIndexBits,shaderType,lod);
};
Hat.prototype=Object.create(Mesh.prototype);
Hat.prototype.constructor=Hat;
Hat.prototype.getDistinctVertexCount=function(lodSymbol){
	return "Math.pow((1<<"+lodSymbol+")+1,2)";
};
Hat.prototype.getTotalVertexCount=function(lodSymbol){
	return "Math.pow((1<<"+lodSymbol+"),2)*6";
};
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
		lines.a(
			"var ic=(i&1)*2+(j&1);",
			"vertices[vertexOffset+3]=colors[ic][0];",
			"vertices[vertexOffset+4]=colors[ic][1];",
			"vertices[vertexOffset+5]=colors[ic][2];"
		);
	}
	return lines;
};

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

exports.Square=Square;
exports.Triangle=Triangle;
exports.Gasket=Gasket;
exports.Cube=Cube;
exports.Hat=Hat;
exports.Terrain=Terrain;
