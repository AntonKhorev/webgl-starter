var Shape=function(shaderType){
	this.shaderType=shaderType; // 'vertex' or 'face' for colors, anything else for no colors
};
Shape.prototype.dim=2;
Shape.prototype.usesElements=false;
Shape.prototype.glPrimitive='TRIANGLES';
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
			"var vertices=new Float32Array(nMaxVertices*"+(c?5:2)+");",
			"var gasketDepth,nVertices;",
			"function storeGasketVertices(newGasketDepth) {",
			"	gasketDepth=newGasketDepth",
			"	nVertices=Math.pow(3,gasketDepth)*3;"
		);
	} else {
		lines.push(
			"var gasketDepth="+this.depth+";",
			"var nVertices=Math.pow(3,gasketDepth)*3;",
			"var vertices=new Float32Array(nVertices*"+(c?5:2)+");",
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
	if (this.shaderType=='face') {
		return [
			"var vertices=new Float32Array([",
			"	// x    y    z    r    g    b",
			"	-0.5,-0.5,-0.5, 1.0, 0.0, 0.0, // left face",
			"	-0.5,-0.5,+0.5, 1.0, 0.0, 0.0,",
			"	-0.5,+0.5,-0.5, 1.0, 0.0, 0.0,",
			"	-0.5,+0.5,+0.5, 1.0, 0.0, 0.0,",
			"	+0.5,-0.5,-0.5, 0.0, 1.0, 0.0, // right face",
			"	+0.5,+0.5,-0.5, 0.0, 1.0, 0.0,",
			"	+0.5,-0.5,+0.5, 0.0, 1.0, 0.0,",
			"	+0.5,+0.5,+0.5, 0.0, 1.0, 0.0,",
			"	-0.5,-0.5,-0.5, 1.0, 1.0, 0.0, // bottom face",
			"	+0.5,-0.5,-0.5, 1.0, 1.0, 0.0,",
			"	-0.5,-0.5,+0.5, 1.0, 1.0, 0.0,",
			"	+0.5,-0.5,+0.5, 1.0, 1.0, 0.0,",
			"	-0.5,+0.5,-0.5, 0.0, 0.0, 1.0, // top face",
			"	-0.5,+0.5,+0.5, 0.0, 0.0, 1.0,",
			"	+0.5,+0.5,-0.5, 0.0, 0.0, 1.0,",
			"	+0.5,+0.5,+0.5, 0.0, 0.0, 1.0,",
			"	-0.5,-0.5,-0.5, 1.0, 0.0, 1.0, // back face",
			"	-0.5,+0.5,-0.5, 1.0, 0.0, 1.0,",
			"	+0.5,-0.5,-0.5, 1.0, 0.0, 1.0,",
			"	+0.5,+0.5,-0.5, 1.0, 0.0, 1.0,",
			"	-0.5,-0.5,+0.5, 0.0, 1.0, 1.0, // front face",
			"	+0.5,-0.5,+0.5, 0.0, 1.0, 1.0,",
			"	-0.5,+0.5,+0.5, 0.0, 1.0, 1.0,",
			"	+0.5,+0.5,+0.5, 0.0, 1.0, 1.0,",
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

exports.Square=Square;
exports.Triangle=Triangle;
exports.Gasket=Gasket;
exports.Cube=Cube;
