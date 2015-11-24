var Lines=require('../lines.js');

var Shape=function(elementIndexBits,shaderType){
	this.elementIndexBits=elementIndexBits; // 0 if don't want element arrays; 8, 16 or 32 bits per element index, limits lod of shape
	this.shaderType=shaderType; // 'vertex' or 'face' for colors, 'light' for normals, anything else for no colors/normals
};
Shape.prototype.dim=2;
Shape.prototype.twoSided=true; // triangles can be viewed from both sides
Shape.prototype.glPrimitive='TRIANGLES';
Shape.prototype.usesElements=function(){
	return this.elementIndexBits>0;
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
Shape.prototype.getElementIndexJsArray=function(){
	return "Uint"+this.elementIndexBits+"Array";
};
Shape.prototype.getElementIndexGlType=function(){
	if (this.elementIndexBits==8) {
		return "gl.UNSIGNED_BYTE"; // not recommended by ms [https://msdn.microsoft.com/en-us/library/dn798776%28v=vs.85%29.aspx]
	} else if (this.elementIndexBits==16) {
		return "gl.UNSIGNED_SHORT"; // mozilla examples use this
	} else if (this.elementIndexBits==32) {
		return "gl.UNSIGNED_INT"; // needs extension
	}
};
Shape.prototype.writeDebug=function(debugArrays){
	var lines=new Lines;
	if (debugArrays) {
		lines.a("console.log('vertex array byte length:',vertices.byteLength);");
		if (this.usesElements()) {
			lines.a("console.log('element array byte length:',elements.byteLength);");
			lines.a("console.log('vertex+element array byte length:',vertices.byteLength+elements.byteLength);");
		}
	}
	return lines;
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
Shape.prototype.writeArraysAndBufferData=function(debugArrays,c,cv){
	return new Lines(
		this.writeArrays(c,cv),
		this.writeDebug(debugArrays),
		this.writeBufferData()
	);
};
// public fn for init
Shape.prototype.writeInit=function(debugArrays){
	var c=(this.shaderType=='vertex' || this.shaderType=='face');
	var cv=this.shaderType=='vertex';
	var lines=new Lines;
	lines.a(
		"gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());"
	);
	if (this.usesElements()) {
		lines.a(
			"gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());"
		);
	}
	lines.a(
		this.writeArraysAndBufferData(debugArrays,c,cv),
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
		return new Lines("gl.drawElements(gl."+this.glPrimitive+",nElements,"+this.getElementIndexGlType()+",0);");
	} else {
		return new Lines("gl.drawArrays(gl."+this.glPrimitive+",0,nVertices);");
	}
};

module.exports=Shape;
