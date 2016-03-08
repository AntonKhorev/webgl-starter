'use strict'

const fixOptHelp=require('../fixed-options-helpers')
const Input=require('../input-classes')
const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const IndentLines=require('crnx-base/indent-lines')
const Listener=require('../listener-classes')
const Colorgen=require('../colorgen')
const Shape=require('./shape')
const IntFeature=require('../int-feature')

class LodShape extends Shape {
	constructor(options,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs) {
		super(options,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs)
		this.lod=fixOptHelp.capNumber(options.lod,this.getMaxPossibleLod(options.lod.max))
		this.features.push(
			new IntFeature('shape.lod',this.lod)
		)
	}
	getMaxPossibleLod(requestedMaxLod) { // due to element index type
		if (!this.usesElements() || this.elementIndexBits>=31) { // 1<<31 is a negative number, can't compare with it
			return requestedMaxLod // no need to limit lod if elements are not used or index type is large enough
		}
		const nVerticesFn = this.hasColorsPerFace
			? this.getFaceVertexCount
			: this.getDistinctVertexCount
		const indexLimit=1<<this.elementIndexBits
		for (let m=requestedMaxLod;m>=0;m--) {
			let n=eval(nVerticesFn(m))
			if (n<=indexLimit) {
				return m
			}
		}
		// TODO fail here
	}
	writeColorData() {
		const a=JsLines.b()
		const colorgen=new Colorgen(this.colorAttrs,0)
		for (let i=0;i<4;i++) {
			a("["+colorgen.getNextColorString().slice(1,-1)+"],")
		}
		return WrapLines.b(
			JsLines.bae("var colors=["),
			JsLines.bae("];")
		).ae(a.e())
	}
	// abstract getDistinctVertexCount(lodSymbol) {} // # of distinct vertices where one vertex can be shared between different faces and output primitives
	// abstract getFaceVertexCount(lodSymbol) {} // # of distinct (vertex,face) pairs that still can be shared between output primitives
	// abstract getTotalVertexCount(lodSymbol) {} // # of vertices in output primitives = # of elements when element arrays are in use
	// abstract writeStoreShape() {}
	writeArraysAndBufferData(debugArrays) {
		const nVerticesFn = this.hasColorsPerFace
			? this.getFaceVertexCount
			: this.getDistinctVertexCount
		const a=JsLines.b()
		if (this.lod.input!='constant') {
			a(
				"var minShapeLod="+this.lod.min+";",
				"var maxShapeLod="+this.lod.max+";"
			)
			if (this.usesElements()) {
				a(
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
				)
			} else {
				a(
					"var nMaxVertices="+this.getTotalVertexCount("maxShapeLod")+";",
					"var vertices=new Float32Array(nMaxVertices*"+this.getNumbersPerVertex()+");",
					this.writeDebug(debugArrays),
					"var shapeLod,nVertices;",
					"function storeShape(newShapeLod) {",
					"	shapeLod=newShapeLod;",
					"	nVertices="+this.getTotalVertexCount("shapeLod")+";"
				)
			}
		} else {
			a(
				"var shapeLod="+this.lod+";"
			)
			if (this.usesElements()) {
				a(
					"var nVertices="+nVerticesFn("shapeLod")+";",
					"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
					"var nElements="+this.getTotalVertexCount("shapeLod")+";",
					"var elements=new "+this.getElementIndexJsArray()+"(nElements);",
					this.writeDebug(debugArrays),
					"function storeShape() {"
				)
			} else {
				a(
					"var nVertices="+this.getTotalVertexCount("shapeLod")+";",
					"var vertices=new Float32Array(nVertices*"+this.getNumbersPerVertex()+");",
					this.writeDebug(debugArrays),
					"function storeShape() {"
				)
			}
		}
		a(
			IndentLines.bae(this.writeStoreShape()),
			IndentLines.bae(this.writeBufferData()),
			"}"
		)
		if (this.lod.input!='constant') {
			a("storeShape("+this.lod+");")
		} else {
			a("storeShape();")
		}
		return a.e()
	}
	getJsInitLines(featureContext) {
		const a=JsLines.ba(super.getJsInitLines(featureContext))
		if (this.lod.input=='slider') {
			var listener=new Listener.Slider('shape.lod')
			listener.enter()
				.log("console.log(this.id,'input value:',parseInt(this.value));")
				.post("storeShape(parseInt(this.value));")
			a(
				featureContext.getListenerLines(listener)
			)
		} else if (this.lod.input instanceof Input.MouseMove) {
			featureContext.canvasMousemoveListener.enter()
				.newVarInt(this.lod.input,'shapeLod')
				.cond("newShapeLod!=shapeLod")
				.log("console.log('shapeLod input value:',newShapeLod);")
				.post("storeShape(newShapeLod);")
		}
		return a.e()
	}
}

module.exports=LodShape
