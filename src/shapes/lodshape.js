'use strict';

const fixOptHelp=require('../fixed-options-helpers.js');
const Lines=require('../lines.js');
const Listener=require('../listener-classes.js');
const Colorgen=require('../colorgen.js');
const Shape=require('./shape.js');
const IntFeature=require('../int-feature.js');

class LodShape extends Shape {
	constructor(options,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs) {
		super(options,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs);
		this.lod=fixOptHelp.capNumber(options.lod,this.getMaxPossibleLod(options.lod.max));
		this.features.push(
			new IntFeature('shape.lod',this.lod)
		);
	}
	getMaxPossibleLod(requestedMaxLod) { // due to element index type
		if (!this.usesElements() || this.elementIndexBits>=31) { // 1<<31 is a negative number, can't compare with it
			return requestedMaxLod; // no need to limit lod if elements are not used or index type is large enough
		}
		const nVerticesFn = this.hasColorsPerFace
			? this.getFaceVertexCount
			: this.getDistinctVertexCount;
		const indexLimit=1<<this.elementIndexBits;
		for (let m=requestedMaxLod;m>=0;m--) {
			let n=eval(nVerticesFn(m));
			if (n<=indexLimit) {
				return m;
			}
		}
		// TODO fail here
	}
	writeColorData() {
		const lines=new Lines;
		const colorgen=new Colorgen(this.colorAttrs,0);
		for (let i=0;i<4;i++) {
			lines.a("["+colorgen.getNextColorString().slice(1,-1)+"],");
		}
		return lines.wrap(
			"var colors=[",
			"];"
		);
	}
	// abstract getDistinctVertexCount(lodSymbol) {} // # of distinct vertices where one vertex can be shared between different faces and output primitives
	// abstract getFaceVertexCount(lodSymbol) {} // # of distinct (vertex,face) pairs that still can be shared between output primitives
	// abstract getTotalVertexCount(lodSymbol) {} // # of vertices in output primitives = # of elements when element arrays are in use
	// abstract writeStoreShape() {}
	writeArraysAndBufferData(debugArrays) {
		const nVerticesFn = this.hasColorsPerFace
			? this.getFaceVertexCount
			: this.getDistinctVertexCount;
		const lines=new Lines;
		if (this.lod.input!='constant') {
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
				"var shapeLod="+this.lod+";"
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
			this.writeStoreShape().indent(),
			this.writeBufferData().indent(),
			"}"
		);
		if (this.lod.input!='constant') {
			lines.a(
				"storeShape("+this.lod+");"
			);
		} else {
			lines.a(
				"storeShape();"
			);
		}
		return lines;
	}
	getJsInitLines(featureContext) {
		const lines=super.getJsInitLines(featureContext);
		if (this.lod.input=='slider') {
			var listener=new Listener.Slider('shape.lod');
			listener.enter()
				.log("console.log(this.id,'input value:',parseInt(this.value));")
				.post("storeShape(parseInt(this.value));");
			lines.a(
				featureContext.getListenerLines(listener)
			);
		} else if (this.lod.input=='mousemovex' || this.lod.input=='mousemovey') {
			featureContext.canvasMousemoveListener.enter()
				.newVarInt(this.lod.input,'shapeLod')
				.cond("newShapeLod!=shapeLod")
				.log("console.log('shapeLod input value:',newShapeLod);")
				.post("storeShape(newShapeLod);");
		}
		return lines;
	}
}

module.exports=LodShape;
