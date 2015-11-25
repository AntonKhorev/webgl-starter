var Lines=require('../lines.js');
var Shape=require('./shape.js');

var LodShape=function(elementIndexBits,shaderType,lod){
	Shape.call(this,elementIndexBits,shaderType);
	this.lod=lod;
	var maxLod=this.getMaxPossibleLod();
	if (this.lod.value>maxLod) this.lod.value=maxLod;
	if (this.lod.max>maxLod) this.lod.max=maxLod;
};
LodShape.prototype=Object.create(Shape.prototype);
LodShape.prototype.constructor=LodShape;
LodShape.prototype.getMaxPossibleLod=function(){ // due to element index type
	if (!this.usesElements() || this.elementIndexBits>=31) { // 1<<31 is a negative number, can't compare with it
		return this.lod.max; // no need to limit lod if elements are not used or index type is large enough
	}
	var nVerticesFn = this.shaderType=='face'
		? this.getFaceVertexCount
		: this.getDistinctVertexCount;
	var indexLimit=1<<this.elementIndexBits;
	for (var m=this.lod.max;m>=0;m--) {
		var n=eval(nVerticesFn(m));
		if (n<=indexLimit) {
			return m;
		}
	}
	// TODO fail here
};
// abstract LodShape.prototype.getDistinctVertexCount=function(lodSymbol){}; // # of distinct vertices where one vertex can be shared between different faces and output primitives
// abstract LodShape.prototype.getFaceVertexCount=function(lodSymbol){}; // # of distinct (vertex,face) pairs that still can be shared between output primitives
// abstract LodShape.prototype.getTotalVertexCount=function(lodSymbol){}; // # of vertices in output primitives = # of elements when element arrays are in use
// abstract LodShape.prototype.writeStoreShape=function(c,cv){};
LodShape.prototype.writeArraysAndBufferData=function(debugArrays,c,cv){
	var nVerticesFn = this.shaderType=='face'
		? this.getFaceVertexCount
		: this.getDistinctVertexCount;
	var lines=new Lines;
	if (this.lod.changes) {
		lines.a(
			"var minShapeLod="+this.lod.min+";",
			"var maxShapeLod="+this.lod.max+";"
		);
		if (this.usesElements()) {
			lines.a(
				"var nMaxVertices="+nVerticesFn("maxShapeLod")+";",
				"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
				"var nMaxElements="+this.getTotalVertexCount("maxShapeLod")+";",
				"var elements=new "+this.getElementIndexJsArray()+"(nMaxElements);",
				this.writeDebug(debugArrays),
				"var shapeLod,nVertices,nElements;",
				"function storeShape(newShapeLod) {",
				"	shapeLod=newShapeLod;",
				"	nVertices="+nVerticesFn("shapeLod")+";",
				"	nElements="+this.getTotalVertexCount("shapeLod")+";"
			);
		} else {
			lines.a(
				"var nMaxVertices="+this.getTotalVertexCount("maxShapeLod")+";",
				"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
				this.writeDebug(debugArrays),
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
				"var nVertices="+nVerticesFn("shapeLod")+";",
				"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
				"var nElements="+this.getTotalVertexCount("shapeLod")+";",
				"var elements=new "+this.getElementIndexJsArray()+"(nElements);",
				this.writeDebug(debugArrays),
				"function storeShape() {"
			);
		} else {
			lines.a(
				"var nVertices="+this.getTotalVertexCount("shapeLod")+";",
				"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
				this.writeDebug(debugArrays),
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

module.exports=LodShape;
