var Lines=require('./lines.js');

var Shape=function(shaderType){
	this.shaderType=shaderType; // 'vertex' or 'face' for colors, 'light' for normals, anything else for no colors/normals
};
Shape.prototype.dim=2;
Shape.prototype.twoSided=true; // triangles can be viewed from both sides
Shape.prototype.glPrimitive='TRIANGLES';
Shape.prototype.usesElements=function(){
	return false;
};
Shape.prototype.getNumbersPerPosition=function(){
	return this.dim;
};
Shape.prototype.getNumbersPerNormal=function(){
	return (this.shaderType=='light' && this.dim==3) ? 3 : 0;
};
Shape.prototype.getNumbersPerColor=function(){
	return (this.shaderType=='vertex' || this.shaderType=='face') ? 3 : 0;
};
Shape.prototype.getNumbersPerVertex=function(){
	return this.getNumbersPerPosition()+this.getNumbersPerNormal()+this.getNumbersPerColor();
};
Shape.prototype.writeBufferData=function(){
	var lines=new Lines;
	lines.a(
		"gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);"
	);
	if (this.usesElements()) {
		lines.a(
			"gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,elements,gl.STATIC_DRAW);"
		);
	}
	return lines;
};
Shape.prototype.writeArraysAndBufferData=function(c,cv){
	return new Lines(
		this.writeArrays(c,cv),
		this.writeBufferData()
	);
};
// public fn for init
Shape.prototype.writeInit=function(){
	var c=(this.shaderType=='vertex' || this.shaderType=='face');
	var cv=this.shaderType=='vertex';
	var lines=new Lines;
	lines.a(
		"gl.getExtension('OES_element_index_uint');", // check if null is returned and don't allow more elements
		"gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());"
	);
	if (this.usesElements()) {
		lines.a(
			"gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());"
		);
	}
	lines.a(
		this.writeArraysAndBufferData(c,cv),
		"var positionLoc=gl.getAttribLocation(program,'position');"
	);
	if (c) {
		lines.a(
			"gl.vertexAttribPointer(",
			"	positionLoc,"+this.dim+",gl.FLOAT,false,",
			"	Float32Array.BYTES_PER_ELEMENT*"+(this.dim+3)+",",
			"	Float32Array.BYTES_PER_ELEMENT*0",
			");",
			"gl.enableVertexAttribArray(positionLoc);",
			"var colorLoc=gl.getAttribLocation(program,'color');",
			"gl.vertexAttribPointer(",
			"	colorLoc,3,gl.FLOAT,false,",
			"	Float32Array.BYTES_PER_ELEMENT*"+(this.dim+3)+",",
			"	Float32Array.BYTES_PER_ELEMENT*"+this.dim,
			");",
			"gl.enableVertexAttribArray(colorLoc);"
		);
	} else if (this.dim>2 && this.shaderType=='light') {
		lines.a(
			"gl.vertexAttribPointer(",
			"	positionLoc,"+this.dim+",gl.FLOAT,false,",
			"	Float32Array.BYTES_PER_ELEMENT*"+(this.dim+3)+",",
			"	Float32Array.BYTES_PER_ELEMENT*0",
			");",
			"gl.enableVertexAttribArray(positionLoc);",
			"var normalLoc=gl.getAttribLocation(program,'normal');",
			"gl.vertexAttribPointer(",
			"	normalLoc,3,gl.FLOAT,false,",
			"	Float32Array.BYTES_PER_ELEMENT*"+(this.dim+3)+",",
			"	Float32Array.BYTES_PER_ELEMENT*"+this.dim,
			");",
			"gl.enableVertexAttribArray(normalLoc);"
		);
	} else {
		lines.a(
			"gl.vertexAttribPointer(positionLoc,"+this.dim+",gl.FLOAT,false,0,0);",
			"gl.enableVertexAttribArray(positionLoc);"
		);
	}
	return lines;
};
// public fn for render
Shape.prototype.writeDraw=function(){
	if (this.usesElements()) {
		//return new Lines("gl.drawElements(gl."+this.glPrimitive+",nElements,gl.UNSIGNED_SHORT,0);");
		// element array types:
		// 	UNSIGNED_BYTE - not recommended by ms [https://msdn.microsoft.com/en-us/library/dn798776%28v=vs.85%29.aspx]
		//	UNSIGNED_SHORT - mozilla examples use this
		//	UNSIGNED_INT - needs extension
		return new Lines("gl.drawElements(gl."+this.glPrimitive+",nElements,gl.UNSIGNED_INT,0);");
	} else {
		return new Lines("gl.drawArrays(gl."+this.glPrimitive+",0,nVertices);");
	}
};

var LodShape=function(shaderType,lod){
	Shape.call(this,shaderType);
	this.lod=lod;
};
LodShape.prototype=Object.create(Shape.prototype);
LodShape.prototype.constructor=LodShape;
// abstract LodShape.prototype.getDistinctVertexCount=function(lodSymbol){}; // # of vertices when usesElements()
// abstract LodShape.prototype.getTotalVertexCount=function(lodSymbol){}; // # of elements when usesElements(), otherwise # of vertices
// abstract LodShape.prototype.writeStoreShape=function(c,cv){};
LodShape.prototype.writeArraysAndBufferData=function(c,cv){
	var lines=new Lines;
	if (this.lod.changes) {
		lines.a(
			"var minShapeLod="+this.lod.min+";",
			"var maxShapeLod="+this.lod.max+";"
		);
		if (this.usesElements()) {
			lines.a(
				"var nMaxVertices="+this.getDistinctVertexCount("maxShapeLod")+";",
				"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
				"var nMaxElements="+this.getTotalVertexCount("maxShapeLod")+";",
				"var elements=new Uint16Array(nMaxElements);",
				"var shapeLod,nVertices,nElements;",
				"function storeShape(newShapeLod) {",
				"	shapeLod=newShapeLod;",
				"	nVertices="+this.getDistinctVertexCount("shapeLod")+";",
				"	nElements="+this.getTotalVertexCount("shapeLod")+";"
			);
		} else {
			lines.a(
				"var nMaxVertices="+this.getTotalVertexCount("maxShapeLod")+";",
				"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
				"var shapeLod,nVertices;",
				"function storeShape(newShapeLod) {",
				"	shapeLod=newShapeLod;",
				"	nVertices="+this.getTotalVertexCount("shapeLod")+";"
			);
		}
	} else {
		lines.a(
			"var shapeLod="+this.lod.value+";"
		);
		if (this.usesElements()) {
			lines.a(
				"var nVertices="+this.getDistinctVertexCount("shapeLod")+";",
				"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
				"var nElements="+this.getTotalVertexCount("shapeLod")+";",
				"var elements=new Uint16Array(nElements);",
				"function storeShape() {"
			);
		} else {
			lines.a(
				"var nVertices="+this.getTotalVertexCount("shapeLod")+";",
				"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
				"function storeShape() {"
			);
		}
	}
	lines.a(
		this.writeStoreShape(c,cv).indent(),
		this.writeBufferData().indent(),
		"}"
	);
	if (this.lod.changes) {
		lines.a(
			"storeShape("+this.lod.value+");"
		);
	} else {
		lines.a(
			"storeShape();"
		);
	}
	return lines;
};

var Mesh=function(shaderType,lod){
	LodShape.call(this,shaderType,lod);
};
Mesh.prototype=Object.create(LodShape.prototype);
Mesh.prototype.constructor=Mesh;
Mesh.prototype.dim=3;
Mesh.prototype.usesElements=function(){
	return this.shaderType!='face';
};
// abstract Mesh.prototype.writeMeshInit=function(){};
// abstract Mesh.prototype.writeMeshVertex=function(c,cv){};
Mesh.prototype.writeStoreShape=function(c,cv){
	var lines=new Lines;
	lines.a(
		"var res=(1<<shapeLod);"
	);
	if (this.shaderType!='face') {
		lines.a(
			"function vertexElement(i,j) {",
			"	return i*(res+1)+j;",
			"}"
		);
	} else {
		lines.a(
			"function vertexElement(i,j,k) {",
			"	return (i*res+j)*6+k;",
			"}"
		);
	}
	if (this.getNumbersPerNormal()) {
		lines.a(
			"function normalize(v) {",
			"	var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);",
			"	return [v[0]/l,v[1]/l,v[2]/l];",
			"}"
		);
	}
	if (c) {
		lines.a(
			"var colors=[",
			"	[1.0, 1.0, 0.0],",
			"	[1.0, 0.0, 0.0],",
			"	[0.0, 1.0, 0.0],",
			"	[0.0, 0.0, 1.0],",
			"];"
		);
	}
	lines.a(
		this.writeMeshInit()
	);
	if (this.shaderType!='face') {
		lines.a(
			"var i,j;",
			"for (i=0;i<=res;i++) {",
			"	var y=i/res*xyRange*2-xyRange;",
			"	for (j=0;j<=res;j++) {",
			"		var x=j/res*xyRange*2-xyRange;",
			"		var vertexOffset=vertexElement(i,j)*"+this.getNumbersPerVertex()+";",
			this.writeMeshVertex(c,cv).indent(2),
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
	} else {
		lines.a(
			"for (var i=0;i<res;i++) {",
			"	for (var j=0;j<res;j++) {",
			"		for (var k=0;k<6;k++) {",
			"			var di=[0,0,1,1,0,1][k];",
			"			var dj=[0,1,0,0,1,1][k];",
			"			var y=(i+di)/res*xyRange*2-xyRange;",
			"			var x=(j+dj)/res*xyRange*2-xyRange;",
			"			var vertexOffset=vertexElement(i,j,k)*"+this.getNumbersPerVertex()+";",
			this.writeMeshVertex(c,cv).indent(3),
			"		}",
			"	}",
			"}"
		);
	}
	return lines;
};

var Square=function(shaderType){
	Shape.call(this,shaderType);
};
Square.prototype=Object.create(Shape.prototype);
Square.prototype.constructor=Square;
Square.prototype.glPrimitive='TRIANGLE_FAN';
Square.prototype.writeArrays=function(c,cv){
	return new Lines(
		"var nVertices=4;",
		"var vertices=new Float32Array([",
		"	// x    y"+(c?   "    r    g    b":""),
		"	-0.5,-0.5,"+(c?cv?" 1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	+0.5,-0.5,"+(c?cv?" 0.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	+0.5,+0.5,"+(c?cv?" 0.0, 0.0, 1.0,":" 1.0, 0.0, 0.0,":""),
		"	-0.5,+0.5,"+(c?cv?" 1.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"]);"
	);
};

var Triangle=function(shaderType){
	Shape.call(this,shaderType);
};
Triangle.prototype=Object.create(Shape.prototype);
Triangle.prototype.constructor=Triangle;
Triangle.prototype.writeArrays=function(c,cv){
	return new Lines(
		"var nVertices=3;",
		"var vertices=new Float32Array([",
		"	//                   x                      y"+(c?"    r    g    b":""),
		"	-Math.sin(0/3*Math.PI), Math.cos(0/3*Math.PI),"+(c?cv?" 1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	-Math.sin(2/3*Math.PI), Math.cos(2/3*Math.PI),"+(c?cv?" 0.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	-Math.sin(4/3*Math.PI), Math.cos(4/3*Math.PI),"+(c?cv?" 0.0, 0.0, 1.0,":" 1.0, 0.0, 0.0,":""),
		"]);"
	);
};

var Gasket=function(shaderType,lod){
	LodShape.call(this,shaderType,lod);
};
Gasket.prototype=Object.create(LodShape.prototype);
Gasket.prototype.constructor=Gasket;
Gasket.prototype.getTotalVertexCount=function(lodSymbol){
	return "Math.pow(3,"+lodSymbol+")*3";
};
Gasket.prototype.writeStoreShape=function(c,cv){
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

var Cube=function(shaderType){
	Shape.call(this,shaderType);
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
			//"var elements=new Uint16Array([",
			"var elements=new Uint32Array([",
			//
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
			//"var elements=new Uint16Array([",
			"var elements=new Uint32Array([",
			//
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

var Hat=function(shaderType,lod){
	Mesh.call(this,shaderType,lod);
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

var Terrain=function(shaderType,lod){
	Mesh.call(this,shaderType,lod);
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
