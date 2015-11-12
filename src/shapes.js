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
	lines=[
		"gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);"
	];
	if (this.usesElements()) {
		lines.push(
			"gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,elements,gl.STATIC_DRAW);"
		);
	}
	return lines;
};
Shape.prototype.writeArraysAndBufferData=function(c,cv){
	return this.writeArrays(c,cv).concat(this.writeBufferData());
};
// public fn for init
Shape.prototype.writeInit=function(){
	var c=(this.shaderType=='vertex' || this.shaderType=='face');
	var cv=this.shaderType=='vertex';
	var lines=[];
	lines.push(
		"gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());"
	);
	if (this.usesElements()) {
		lines.push(
			"gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());"
		);
	}
	lines=lines.concat(this.writeArraysAndBufferData(c,cv));
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
// public fn for render
Shape.prototype.writeDraw=function(){
	if (this.usesElements()) {
		return ["gl.drawElements(gl."+this.glPrimitive+",nElements,gl.UNSIGNED_SHORT,0);"];
	} else {
		return ["gl.drawArrays(gl."+this.glPrimitive+",0,nVertices);"];
	}
};

var LodShape=function(shaderType,lod){
	Shape.call(this,shaderType);
	this.lod=lod;
};
LodShape.prototype=Object.create(Shape.prototype);
LodShape.prototype.constructor=LodShape;

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

var Gasket=function(shaderType,lod){
	LodShape.call(this,shaderType,lod);
};
Gasket.prototype=Object.create(LodShape.prototype);
Gasket.prototype.constructor=Gasket;
Gasket.prototype.writeArraysAndBufferData=function(c,cv){
	lines=[];
	if (this.lod.changes) {
		lines.push(
			"var minShapeLod="+this.lod.min+";",
			"var maxShapeLod="+this.lod.max+";",
			"var nMaxVertices=Math.pow(3,maxShapeLod)*3;",
			"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
			"var shapeLod,nVertices;",
			"function storeShape(newShapeLod) {",
			"	shapeLod=newShapeLod;",
			"	nVertices=Math.pow(3,shapeLod)*3;"
		);
	} else {
		lines.push(
			"var shapeLod="+this.lod.value+";",
			"var nVertices=Math.pow(3,shapeLod)*3;",
			"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
			"function storeShape() {"
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
		"		shapeLod,",
		"		[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],",
		"		[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],",
		"		[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]",
		"	);"
	);
	lines=lines.concat(this.writeBufferData()); // TODO indent
	lines.push(
		"}"
	);
	if (this.lod.changes) {
		lines.push(
			"storeShape("+this.lod.value+");"
		);
	} else {
		lines.push(
			"storeShape();"
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
Cube.prototype.twoSided=false;
Cube.prototype.usesElements=function(){
	return true;
};
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

var Hat=function(shaderType,lod){
	LodShape.call(this,shaderType,lod);
};
Hat.prototype=Object.create(LodShape.prototype);
Hat.prototype.constructor=Hat;
Hat.prototype.dim=3;
Hat.prototype.usesElements=function(){
	return this.shaderType!='face';
};
Hat.prototype.writeArraysAndBufferData=function(c,cv){
	lines=[];
	if (this.lod.changes) {
		lines.push(
			"var minShapeLod="+this.lod.min+";",
			"var maxShapeLod="+this.lod.max+";"
		);
		if (this.shaderType!='face') {
			lines.push(
				"var nMaxVertices=((1<<maxShapeLod)+1)*((1<<maxShapeLod)+1);",
				"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
				"var nMaxElements=(1<<maxShapeLod)*(1<<maxShapeLod)*6;",
				"var elements=new Uint16Array(nMaxElements);",
				"var shapeLod,nVertices,nElements;",
				"function storeShape(newShapeLod) {",
				"	shapeLod=newShapeLod;",
				"	nVertices=((1<<shapeLod)+1)*((1<<shapeLod)+1);",
				"	nElements=(1<<shapeLod)*(1<<shapeLod)*6;"
			);
		} else {
			lines.push(
				"var nMaxVertices=(1<<maxShapeLod)*(1<<maxShapeLod)*6;",
				"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
				"var shapeLod,nVertices;",
				"function storeShape(newShapeLod) {",
				"	shapeLod=newShapeLod;",
				"	nVertices=(1<<shapeLod)*(1<<shapeLod)*6;"
			);
		}
	} else {
		lines.push(
			"var shapeLod="+this.lod.value+";"
		);
		if (this.shaderType!='face') {
			lines.push(
				"var nVertices=((1<<shapeLod)+1)*((1<<shapeLod)+1);",
				"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
				"var nElements=(1<<shapeLod)*(1<<shapeLod)*6;",
				"var elements=new Uint16Array(nElements);",
				"function storeShape() {"
			);
		} else {
			lines.push(
				"var nVertices=(1<<shapeLod)*(1<<shapeLod)*6;",
				"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
				"function storeShape() {"
			);
		}
	}
	lines.push(
		"	var xyRange=4;",
		"	var xyScale=1/(4*Math.sqrt(2));",
		"	var res=(1<<shapeLod);"
	);
	if (this.shaderType!='face') {
		lines.push(
			"	function vertexElement(i,j) {",
			"		return i*(res+1)+j;",
			"	}"
		);
	} else {
		lines.push(
			"	function vertexElement(i,j,k) {",
			"		return (i*res+j)*6+k;",
			"	}"
		);
	}
	if (this.getNumbersPerNormal()) {
		lines.push(
			"	function normalize(v) {",
			"		var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);",
			"		return [v[0]/l,v[1]/l,v[2]/l];",
			"	}"
		);
	}
	if (c) {
		lines.push(
			"	var colors=[",
			"		[1.0, 1.0, 0.0],",
			"		[1.0, 0.0, 0.0],",
			"		[0.0, 1.0, 0.0],",
			"		[0.0, 0.0, 1.0],",
			"	];"
		);
	}
	var innerLines=[];
	innerLines.push(
		"var r2=(x*x+y*y)/2;",
		"var A=Math.exp(-r2)/Math.PI;",
		"var z=A*(1-r2);",
		"vertices[vertexOffset+0]=x*xyScale;",
		"vertices[vertexOffset+1]=y*xyScale;",
		"vertices[vertexOffset+2]=z;"
	);
	if (this.getNumbersPerNormal()) {
		innerLines.push(
			"var normal=normalize([(z+A)*x/xyScale,(z+A)*y/xyScale,1]);",
			"vertices[vertexOffset+3]=normal[0];",
			"vertices[vertexOffset+4]=normal[1];",
			"vertices[vertexOffset+5]=normal[2];"
		);
	} else if (c) {
		innerLines.push(
			"var ic=(i&1)*2+(j&1);",
			"vertices[vertexOffset+3]=colors[ic][0];",
			"vertices[vertexOffset+4]=colors[ic][1];",
			"vertices[vertexOffset+5]=colors[ic][2];"
		);
	}
	if (this.shaderType!='face') {
		lines.push(
			"	var i,j;",
			"	for (i=0;i<=res;i++) {",
			"		var y=i/res*xyRange*2-xyRange;",
			"		for (j=0;j<=res;j++) {",
			"			var x=j/res*xyRange*2-xyRange;",
			"			var vertexOffset=vertexElement(i,j)*"+this.getNumbersPerVertex()+";"
		);
		innerLines.forEach(function(innerLine){
			lines.push(
				"			"+innerLine
			);
		});
		lines.push(
			"		}",
			"	}",
			"	for (i=0;i<res;i++) {",
			"		for (j=0;j<res;j++) {",
			"			var elementOffset=(i*res+j)*6;",
			"			elements[elementOffset+0]=vertexElement(i+0,j+0);",
			"			elements[elementOffset+1]=vertexElement(i+0,j+1);",
			"			elements[elementOffset+2]=vertexElement(i+1,j+0);",
			"			elements[elementOffset+3]=vertexElement(i+1,j+0);",
			"			elements[elementOffset+4]=vertexElement(i+0,j+1);",
			"			elements[elementOffset+5]=vertexElement(i+1,j+1);",
			"		}",
			"	}"
		);
	} else {
		lines.push(
			"	for (var i=0;i<res;i++) {",
			"		for (var j=0;j<res;j++) {",
			"			for (var k=0;k<6;k++) {",
			"				var di=[0,0,1,1,0,1][k];",
			"				var dj=[0,1,0,0,1,1][k];",
			"				var y=(i+di)/res*xyRange*2-xyRange;",
			"				var x=(j+dj)/res*xyRange*2-xyRange;",
			"				var vertexOffset=vertexElement(i,j,k)*"+this.getNumbersPerVertex()+";"
		);
		innerLines.forEach(function(innerLine){
			lines.push(
				"				"+innerLine
			);
		});
		lines.push(
			"			}",
			"		}",
			"	}"
		);
	}
	lines=lines.concat(this.writeBufferData()); // TODO indent
	lines.push(
		"}"
	);
	if (this.lod.changes) {
		lines.push(
			"storeShape("+this.lod.value+");"
		);
	} else {
		lines.push(
			"storeShape();"
		);
	}
	return lines;
};

var Terrain=function(shaderType,lod){
	LodShape.call(this,shaderType,lod);
};
Terrain.prototype=Object.create(LodShape.prototype);
Terrain.prototype.constructor=Terrain;
Terrain.prototype.dim=3;
Terrain.prototype.usesElements=function(){
	return this.shaderType!='face';
};
Terrain.prototype.writeArraysAndBufferData=function(c,cv){
	lines=[];
	if (this.lod.changes) {
		lines.push(
			"var minShapeLod="+this.lod.min+";",
			"var maxShapeLod="+this.lod.max+";"
		);
		if (this.shaderType!='face') {
			lines.push(
				"var nMaxVertices=Math.pow((1<<maxShapeLod)+1,2);",
				"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
				"var nMaxElements=Math.pow((1<<maxShapeLod),2)*6;",
				"var elements=new Uint16Array(nMaxElements);",
				"var shapeLod,nVertices,nElements;",
				"function storeShape(newShapeLod) {",
				"	shapeLod=newShapeLod;",
				"	nVertices=Math.pow((1<<shapeLod)+1,2);",
				"	nElements=Math.pow((1<<shapeLod),2)*6;"
			);
		} else {
			lines.push(
				"var nMaxVertices=Math.pow((1<<maxShapeLod),2)*6;",
				"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
				"var shapeLod,nVertices;",
				"function storeShape(newShapeLod) {",
				"	shapeLod=newShapeLod;",
				"	nVertices=Math.pow((1<<shapeLod),2)*6;"
			);
		}
	} else {
		lines.push(
			"var shapeLod="+this.lod.value+";"
		);
		if (this.shaderType!='face') {
			lines.push(
				"var nVertices=Math.pow((1<<shapeLod)+1,2);",
				"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
				"var nElements=Math.pow((1<<shapeLod),2)*6;",
				"var elements=new Uint16Array(nElements);",
				"function storeShape() {"
			);
		} else {
			lines.push(
				"var nVertices=Math.pow((1<<shapeLod),2)*6;",
				"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
				"function storeShape() {"
			);
		}
	}
	lines.push(
		"	var xyRange=1/Math.sqrt(2);",
		"	var zRange=xyRange;",
		"	var res=1<<shapeLod;",
		"	var mask=res-1;"
	);
	if (this.shaderType!='face') {
		lines.push(
			"	function vertexElement(i,j) {",
			"		return i*(res+1)+j;",
			"	}"
		);
	} else {
		lines.push(
			"	function vertexElement(i,j,k) {",
			"		return (i*res+j)*6+k;",
			"	}"
		);
	}
	if (this.getNumbersPerNormal()) {
		lines.push(
			"	function normalize(v) {",
			"		var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);",
			"		return [v[0]/l,v[1]/l,v[2]/l];",
			"	}"
		);
	}
	if (c) {
		lines.push(
			"	var colors=[",
			"		[1.0, 1.0, 0.0],",
			"		[1.0, 0.0, 0.0],",
			"		[0.0, 1.0, 0.0],",
			"		[0.0, 0.0, 1.0],",
			"	];"
		);
	}
	var innerLines=[];
	innerLines.push(
		"vertices[vertexOffset+0]=x;",
		"vertices[vertexOffset+1]=y;",
		(this.shaderType!='face'
			?"// vertices[vertexOffset+2] already written"
			:"vertices[vertexOffset+2]=vertices[zOffset((i+di)&mask,(j+dj)&mask)];"
		)
	);
	if (this.getNumbersPerNormal()) {
		innerLines.push(
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
		innerLines.push(
			"var ic=(i&1)*2+(j&1);",
			"vertices[vertexOffset+3]=colors[ic][0];",
			"vertices[vertexOffset+4]=colors[ic][1];",
			"vertices[vertexOffset+5]=colors[ic][2];"
		);
	}
	lines.push(
		"	function zOffset(i,j) {",
		"		return vertexElement(i,j"+(this.shaderType!='face'?"":",0")+")*"+this.getNumbersPerVertex()+"+2;",
		"	}",
		"	function noise(depth) {",
		"		var r=zRange/Math.pow(2,shapeLod-depth-1);",
		"		return Math.random()*2*r-r;",
		"	}",
		"	vertices[2]=0.0;",
		"	var i1,i2,i3,i4;",
		"	var j1,j2,j3,j4;",
		"	for (var depth=shapeLod-1;depth>=0;depth--) {",
		"		var d=1<<depth;",
		"		// diamond step",
		"		for (i2=d;i2<res;i2+=2*d) {",
		"			for (j2=d;j2<res;j2+=2*d) {",
		"				i1=i2-d;",
		"				j1=j2-d;",
		"				i3=(i2+d)&mask;",
		"				j3=(j2+d)&mask;",
		"				vertices[zOffset(i2,j2)]=(",
		"					vertices[zOffset(i1,j1)]+vertices[zOffset(i1,j3)]+",
		"					vertices[zOffset(i3,j1)]+vertices[zOffset(i3,j3)]",
		"				)/4+noise(depth);",
		"			}",
		"		}",
		"		// square step",
		"		for (i2=d;i2<res;i2+=2*d) {",
		"			for (j2=d;j2<res;j2+=2*d) {",
		"				i0=(i2-2*d)&mask;",
		"				j0=(j2-2*d)&mask;",
		"				i1=(i2-d);",
		"				j1=(j2-d);",
		"				i3=(i2+d)&mask;",
		"				j3=(j2+d)&mask;",
		"				vertices[zOffset(i2,j1)]=(",
		"					vertices[zOffset(i2,j0)]+vertices[zOffset(i1,j1)]+",
		"					vertices[zOffset(i2,j2)]+vertices[zOffset(i3,j1)]",
		"				)/4+noise(depth);",
		"				vertices[zOffset(i1,j2)]=(",
		"					vertices[zOffset(i0,j2)]+vertices[zOffset(i1,j1)]+",
		"					vertices[zOffset(i2,j2)]+vertices[zOffset(i1,j3)]",
		"				)/4+noise(depth);",
		"			}",
		"		}",
		"	}"
	);
	if (this.shaderType!='face') {
		lines.push(
			"	var i,j;",
			"	for (i=0;i<res;i++) vertices[zOffset(i,res)]=vertices[zOffset(i,0)];",
			"	for (j=0;j<res;j++) vertices[zOffset(res,j)]=vertices[zOffset(0,j)];",
			"	vertices[zOffset(res,res)]=vertices[zOffset(0,0)];"
		);
		lines.push(
			"	for (i=0;i<=res;i++) {",
			"		var y=i/res*xyRange*2-xyRange;",
			"		for (j=0;j<=res;j++) {",
			"			var x=j/res*xyRange*2-xyRange;",
			"			var vertexOffset=vertexElement(i,j)*"+this.getNumbersPerVertex()+";"
		);
		innerLines.forEach(function(innerLine){
			lines.push(
				"			"+innerLine
			);
		});
		lines.push(
			"		}",
			"	}"
		);
		lines.push(
			"	for (i=0;i<res;i++) {",
			"		for (j=0;j<res;j++) {",
			"			var elementOffset=(i*res+j)*6;",
			"			elements[elementOffset+0]=vertexElement(i+0,j+0);",
			"			elements[elementOffset+1]=vertexElement(i+0,j+1);",
			"			elements[elementOffset+2]=vertexElement(i+1,j+0);",
			"			elements[elementOffset+3]=vertexElement(i+1,j+0);",
			"			elements[elementOffset+4]=vertexElement(i+0,j+1);",
			"			elements[elementOffset+5]=vertexElement(i+1,j+1);",
			"		}",
			"	}"
		);
	} else {
		lines.push(
			"	for (var i=0;i<res;i++) {",
			"		for (var j=0;j<res;j++) {",
			"			for (var k=0;k<6;k++) {",
			"				var di=[0,0,1,1,0,1][k];",
			"				var dj=[0,1,0,0,1,1][k];",
			"				var y=(i+di)/res*xyRange*2-xyRange;",
			"				var x=(j+dj)/res*xyRange*2-xyRange;",
			"				var vertexOffset=vertexElement(i,j,k)*"+this.getNumbersPerVertex()+";"
		);
		innerLines.forEach(function(innerLine){
			lines.push(
				"				"+innerLine
			);
		});
		lines.push(
			"			}",
			"		}",
			"	}"
		);
	}
	lines=lines.concat(this.writeBufferData()); // TODO indent
	lines.push(
		"}"
	);
	if (this.lod.changes) {
		lines.push(
			"storeShape("+this.lod.value+");"
		);
	} else {
		lines.push(
			"storeShape();"
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
