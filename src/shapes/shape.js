var Lines=require('../lines.js');

var Shape=function(elementIndexBits,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs){
	this.elementIndexBits=elementIndexBits; // 0 if don't want element arrays; 8, 16 or 32 bits per element index, limits lod of shape
	this.hasNormals=(hasReflections && this.dim==3); // true = need normals, unless shape is flat
	this.hasColorsPerVertex=hasColorsPerVertex;
	this.hasColorsPerFace=hasColorsPerFace;
	this.colorAttrs=colorAttrs; // array of color attribute names; examples: [] or ['color'] or ['specularColor','diffuseColor','ambientColor']
};
Shape.prototype.dim=2;
Shape.prototype.twoSided=true; // triangles can be viewed from both sides
Shape.prototype.glPrimitive='TRIANGLES';
Shape.prototype.usesElements=function(){
	return this.elementIndexBits>0;
};
Shape.prototype.getNumbersPerVertex=function(){
	return this.dim+(this.hasNormals?3:0)+this.colorAttrs.length*3;
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
Shape.prototype.writeArraysAndBufferData=function(debugArrays){
	return new Lines(
		this.writeArrays(),
		this.writeDebug(debugArrays),
		this.writeBufferData()
	);
};
// public fn for init
Shape.prototype.writeInit=function(debugArrays){
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
		this.writeArraysAndBufferData(debugArrays)
	);
	var offset=0;
	function writeAttr(attr,size) {
		lines.a(
			"var "+attr+"Loc=gl.getAttribLocation(program,'"+attr+"');",
			"gl.vertexAttribPointer(",
			"	"+attr+"Loc,"+size+",gl.FLOAT,false,",
			"	Float32Array.BYTES_PER_ELEMENT*"+this.getNumbersPerVertex()+",",
			"	Float32Array.BYTES_PER_ELEMENT*"+offset,
			");",
			"gl.enableVertexAttribArray("+attr+"Loc);"
		);
		offset+=size;
	}
	if (!this.hasNormals && this.colorAttrs.length<=0) {
		lines.a(
			"var positionLoc=gl.getAttribLocation(program,'position');",
			"gl.vertexAttribPointer(positionLoc,"+this.dim+",gl.FLOAT,false,0,0);",
			"gl.enableVertexAttribArray(positionLoc);"
		);
	} else {
		writeAttr.call(this,'position',this.dim);
		if (this.hasNormals) {
			writeAttr.call(this,'normal',3);
		}
		this.colorAttrs.forEach(function(attr){
			writeAttr.call(this,attr,3);
		},this);
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
