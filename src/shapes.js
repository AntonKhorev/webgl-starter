var Shape=function(shaderType){
	this.shaderType=shaderType; // 'vertex' or 'face' for colors, 'light' for normals, anything else for no colors/normals
};
Shape.prototype.dim=2;
Shape.prototype.usesElements=false;
Shape.prototype.glPrimitive='TRIANGLES';
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
Shape.prototype.writeInit=function(){
	var c=(this.shaderType=='vertex' || this.shaderType=='face');
	var cv=this.shaderType=='vertex';
	var lines=this.writeArrays(c,cv);
	lines.push(
		"",
		"gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());",
		"gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);",
		""
	);
	if (this.usesElements) {
		lines.push(
			"gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());",
			"gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,elements,gl.STATIC_DRAW);",
			""
		);
	}
	lines.push(
		"var positionLoc=gl.getAttribLocation(program,'position');"
	);
	if (c) {
		lines.push(
			"gl.vertexAttribPointer(",
			"	positionLoc,"+this.dim+",gl.FLOAT,false,",
			"	Float32Array.BYTES_PER_ELEMENT*"+(this.dim+3)+",",
			"	Float32Array.BYTES_PER_ELEMENT*0",
			");",
			"gl.enableVertexAttribArray(positionLoc);",
			"",
			"var colorLoc=gl.getAttribLocation(program,'color');",
			"gl.vertexAttribPointer(",
			"	colorLoc,3,gl.FLOAT,false,",
			"	Float32Array.BYTES_PER_ELEMENT*"+(this.dim+3)+",",
			"	Float32Array.BYTES_PER_ELEMENT*"+this.dim,
			");",
			"gl.enableVertexAttribArray(colorLoc);"
		);
	} else if (this.dim>2 && this.shaderType=='light') {
		lines.push(
			"gl.vertexAttribPointer(",
			"	positionLoc,"+this.dim+",gl.FLOAT,false,",
			"	Float32Array.BYTES_PER_ELEMENT*"+(this.dim+3)+",",
			"	Float32Array.BYTES_PER_ELEMENT*0",
			");",
			"gl.enableVertexAttribArray(positionLoc);",
			"",
			"var normalLoc=gl.getAttribLocation(program,'normal');",
			"gl.vertexAttribPointer(",
			"	normalLoc,3,gl.FLOAT,false,",
			"	Float32Array.BYTES_PER_ELEMENT*"+(this.dim+3)+",",
			"	Float32Array.BYTES_PER_ELEMENT*"+this.dim,
			");",
			"gl.enableVertexAttribArray(normalLoc);"
		);
	} else {
		lines.push(
			"gl.vertexAttribPointer(positionLoc,"+this.dim+",gl.FLOAT,false,0,0);",
			"gl.enableVertexAttribArray(positionLoc);"
		);
	}
	return lines;
};
Shape.prototype.writeDraw=function(){
	if (this.usesElements) {
		return ["gl.drawElements(gl."+this.glPrimitive+",nElements,gl.UNSIGNED_SHORT,0);"];
	} else {
		return ["gl.drawArrays(gl."+this.glPrimitive+",0,nVertices);"];
	}
};

var Square=function(shaderType){
	Shape.call(this,shaderType);
};
Square.prototype=Object.create(Shape.prototype);
Square.prototype.constructor=Square;
Square.prototype.glPrimitive='TRIANGLE_FAN';
Square.prototype.writeArrays=function(c,cv){
	return [
		"var nVertices=4;",
		"var vertices=new Float32Array([",
		"	// x    y"+(c?   "    r    g    b":""),
		"	-0.5,-0.5,"+(c?cv?" 1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	+0.5,-0.5,"+(c?cv?" 0.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	+0.5,+0.5,"+(c?cv?" 0.0, 0.0, 1.0,":" 1.0, 0.0, 0.0,":""),
		"	-0.5,+0.5,"+(c?cv?" 1.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"]);",
	];
};

var Triangle=function(shaderType){
	Shape.call(this,shaderType);
};
Triangle.prototype=Object.create(Shape.prototype);
Triangle.prototype.constructor=Triangle;
Triangle.prototype.writeArrays=function(c,cv){
	return [
		"var nVertices=3;",
		"var vertices=new Float32Array([",
		"	//                   x                      y"+(c?"    r    g    b":""),
		"	-Math.sin(0/3*Math.PI), Math.cos(0/3*Math.PI),"+(c?cv?" 1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	-Math.sin(2/3*Math.PI), Math.cos(2/3*Math.PI),"+(c?cv?" 0.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	-Math.sin(4/3*Math.PI), Math.cos(4/3*Math.PI),"+(c?cv?" 0.0, 0.0, 1.0,":" 1.0, 0.0, 0.0,":""),
		"]);",
	];
};

var Gasket=function(shaderType,depth,isDepthChanges){
	Shape.call(this,shaderType);
	this.depth=depth; // integer >= 0
	this.isDepthChanges=isDepthChanges; // bool, true when depth can change
};
Gasket.prototype=Object.create(Shape.prototype);
Gasket.prototype.constructor=Gasket;
Gasket.prototype.writeArrays=function(c,cv){
	lines=[];
	if (this.isDepthChanges) {
		lines.push(
			"var gasketMaxDepth=10;",
			"var nMaxVertices=Math.pow(3,gasketMaxDepth)*3;",
			"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
			"var gasketDepth,nVertices;",
			"function storeGasketVertices(newGasketDepth) {",
			"	gasketDepth=newGasketDepth",
			"	nVertices=Math.pow(3,gasketDepth)*3;"
		);
	} else {
		lines.push(
			"var gasketDepth="+this.depth+";",
			"var nVertices=Math.pow(3,gasketDepth)*3;",
			"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
			"function storeGasketVertices() {"
		);
	}
	lines.push(
		"	var iv=0;"
	);
	if (this.shaderType=='face') {
		lines.push(
			"	var ic=0;",
			"	var colors=[",
			"		[1.0, 0.0, 0.0],",
			"		[0.0, 1.0, 0.0],",
			"		[0.0, 0.0, 1.0],",
			"		[1.0, 1.0, 0.0],",
			"	];"
		);
	}
	if (this.shaderType=='vertex') {
		lines.push(
			"	function pushVertex(v,r,g,b) {",
			"		vertices[iv++]=v[0]; vertices[iv++]=v[1];",
			"		vertices[iv++]=r; vertices[iv++]=g; vertices[iv++]=b;",
			"	}"
		);
	} else if (this.shaderType=='face') {
		lines.push(
			"	function pushVertex(v,c) {",
			"		vertices[iv++]=v[0]; vertices[iv++]=v[1];",
			"		vertices[iv++]=c[0]; vertices[iv++]=c[1]; vertices[iv++]=c[2];",
			"	}"
		);
	} else {
		lines.push(
			"	function pushVertex(v) {",
			"		vertices[iv++]=v[0]; vertices[iv++]=v[1];",
			"	}"
		);
	}
	lines.push(
		"	function mix(a,b,m) {",
		"		return [",
		"			a[0]*(1-m)+b[0]*m,",
		"			a[1]*(1-m)+b[1]*m,",
		"		];",
		"	}",
		"	function triangle(depth,a,b,c) {",
		"		if (depth<=0) {"
	);
	if (this.shaderType=='vertex') {
		lines.push(
			"			pushVertex(a,1.0,0.0,0.0);",
			"			pushVertex(b,0.0,1.0,0.0);",
			"			pushVertex(c,0.0,0.0,1.0);"
		);
	} else if (this.shaderType=='face') {
		lines.push(
			"			pushVertex(a,colors[ic]);",
			"			pushVertex(b,colors[ic]);",
			"			pushVertex(c,colors[ic]);",
			"			ic=(ic+1)%colors.length;"
		);
	} else {
		lines.push(
			"			pushVertex(a);",
			"			pushVertex(b);",
			"			pushVertex(c);"
		);
	}
	lines.push(
		"		} else {",
		"			var ab=mix(a,b,0.5);",
		"			var bc=mix(b,c,0.5);",
		"			var ca=mix(c,a,0.5);",
		"			triangle(depth-1,a,ab,ca);",
		"			triangle(depth-1,b,bc,ab);",
		"			triangle(depth-1,c,ca,bc);",
		"		}",
		"	}",
		"	triangle(",
		"		gasketDepth,",
		"		[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],",
		"		[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],",
		"		[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]",
		"	);",
		"}"
	);
	if (this.isDepthChanges) {
		lines.push(
			"storeGasketVertices("+this.depth+");"
		);
	} else {
		lines.push(
			"storeGasketVertices();"
		);
	}
	return lines;
};

var Cube=function(shaderType){
	Shape.call(this,shaderType);
};
Cube.prototype=Object.create(Shape.prototype);
Cube.prototype.constructor=Cube;
Cube.prototype.dim=3;
Cube.prototype.usesElements=true;
Cube.prototype.writeArrays=function(c,cv){
	if (this.shaderType=='face' || this.shaderType=='light') {
		var n=this.shaderType=='light';
		return [
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
			"var elements=new Uint16Array([",
			"	 0,  1,  2,  2,  1,  3, // left face",
			"	 4,  5,  6,  6,  5,  7, // right face",
			"	 8,  9, 10, 10,  9, 11, // bottom face",
			"	12, 13, 14, 14, 13, 15, // top face",
			"	16, 17, 18, 18, 17, 19, // back face",
			"	20, 21, 22, 22, 21, 23, // front face",
			"]);",
		];
	} else {
		return [
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
			"var elements=new Uint16Array([",
			"	4, 6, 0, 0, 6, 2, // left face",
			"	1, 3, 5, 5, 3, 7, // right face",
			"	0, 1, 4, 4, 1, 5, // bottom face",
			"	2, 6, 3, 3, 6, 7, // top face",
			"	0, 2, 1, 1, 2, 3, // back face",
			"	5, 7, 4, 4, 7, 6, // front face",
			"]);",
		];
	}
};

var Hat=function(shaderType){
	Shape.call(this,shaderType);
	this.depth=32; // TODO rename depth to subdivisions... or detail level
	this.isDepthChanges=false;
};
Hat.prototype=Object.create(Shape.prototype);
Hat.prototype.constructor=Hat;
Hat.prototype.dim=3;
Hat.prototype.usesElements=true;
Hat.prototype.writeArrays=function(c,cv){
	lines=[];
	if (this.isDepthChanges) {
		// TODO
	} else {
		lines.push(
			"var hatDepth="+this.depth+";",
			"var nVertices=(hatDepth+1)*(hatDepth+1);",
			"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
			"var nElements=hatDepth*hatDepth*6;",
			"var elements=new Uint16Array(nElements);",
			"function storeHatVerticesAndElements() {"
		);
	}
	lines.push(
		"	var xyRange=4;",
		"	var xyScale=1/(4*Math.sqrt(2));",
		"	function vertexElement(i,j) {",
		"		return i*(hatDepth+1)+j;",
		"	}"
	);
	if (this.getNumbersPerNormal()) {
		lines.push(
			"	function normalize(v) {",
			"		var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);",
			"		return [v[0]/l,v[1]/l,v[2]/l];",
			"	}"
		);
	}
	// if (this.shaderType=='face') { // TODO separate vertex entries for different quads (don't need elements?)
	if (c) {
		lines.push(
			"	var ic=0;",
			"	var colors=[",
			"		[1.0, 0.0, 0.0],",
			"		[0.0, 1.0, 0.0],",
			"		[0.0, 0.0, 1.0],",
			"		[1.0, 1.0, 0.0],",
			"	];"
		);
	}
	lines.push(
		"	var i,j;",
		"	for (i=0;i<=hatDepth;i++) {",
		"		var y=i/hatDepth*xyRange*2-xyRange;",
		"		for (j=0;j<=hatDepth;j++) {",
		"			var x=j/hatDepth*xyRange*2-xyRange;",
		"			var vertexOffset=vertexElement(i,j)*"+this.getNumbersPerVertex()+";",
		"			var r2=(x*x+y*y)/2;",
		"			var A=Math.exp(-r2)/Math.PI;",
		"			var z=A*(1-r2);",
		"			vertices[vertexOffset+0]=x*xyScale;",
		"			vertices[vertexOffset+1]=y*xyScale;",
		"			vertices[vertexOffset+2]=z;"
	);
	if (this.getNumbersPerNormal()) {
		lines.push(
			"			var normal=normalize([(z+A)*x/xyScale,(z+A)*y/xyScale,1]);",
			"			vertices[vertexOffset+3]=normal[0];",
			"			vertices[vertexOffset+4]=normal[1];",
			"			vertices[vertexOffset+5]=normal[2];"
		);
	} else if (c) {
		lines.push(
			"			ic=(ic+1)%colors.length;",
			"			vertices[vertexOffset+3]=colors[ic][0];",
			"			vertices[vertexOffset+4]=colors[ic][1];",
			"			vertices[vertexOffset+5]=colors[ic][2];"
		);
	}
	lines.push(
		"		}",
		"	}",
		"	for (i=0;i<hatDepth;i++) {",
		"		for (j=0;j<hatDepth;j++) {",
		"			var elementOffset=(i*hatDepth+j)*6;",
		"			elements[elementOffset+0]=vertexElement(i+0,j+0);",
		"			elements[elementOffset+1]=vertexElement(i+0,j+1);",
		"			elements[elementOffset+2]=vertexElement(i+1,j+0);",
		"			elements[elementOffset+3]=vertexElement(i+1,j+0);",
		"			elements[elementOffset+4]=vertexElement(i+0,j+1);",
		"			elements[elementOffset+5]=vertexElement(i+1,j+1);",
		"		}",
		"	}",
		"}"
	);
	if (this.isDepthChanges) {
		// TODO
		/*
		lines.push(
			"storeHatVerticesAndElements("+this.depth+");"
		);
		*/
	} else {
		lines.push(
			"storeHatVerticesAndElements();"
		);
	}
	return lines;
};

exports.Square=Square;
exports.Triangle=Triangle;
exports.Gasket=Gasket;
exports.Cube=Cube;
exports.Hat=Hat;
