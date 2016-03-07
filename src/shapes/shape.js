'use strict'

const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const Feature=require('../feature')

class Shape extends Feature {
	constructor(options,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs) {
		super()
		this.elementIndexBits=parseInt(options.elements) // 0 if don't want element arrays; 8, 16 or 32 bits per element index, limits lod of shape
		this.hasNormals=(hasReflections && this.dim==3) // true = need normals, unless shape is flat
		this.hasColorsPerVertex=hasColorsPerVertex // TODO support for both hasColorsPerVertex and hasColorsPerFace == true
		this.hasColorsPerFace=hasColorsPerFace
		this.colorAttrs=colorAttrs // array of color attribute structs {name,enabled,weight}
	}
	get dim() { return 2 }
	get twoSided() { return true } // triangles can be viewed from both sides
	get glPrimitive() { return 'TRIANGLES' }
	usesElements() { // TODO convert to getter
		return this.elementIndexBits>0
	}
	getNumbersPerVertex() {
		return this.dim+(this.hasNormals?3:0)+this.colorAttrs.length*3
	}
	getElementIndexJsArray() {
		return "Uint"+this.elementIndexBits+"Array"
	}
	getElementIndexGlType() {
		if (this.elementIndexBits==8) {
			return "gl.UNSIGNED_BYTE" // not recommended by ms [https://msdn.microsoft.com/en-us/library/dn798776%28v=vs.85%29.aspx]
		} else if (this.elementIndexBits==16) {
			return "gl.UNSIGNED_SHORT" // mozilla examples use this
		} else if (this.elementIndexBits==32) {
			return "gl.UNSIGNED_INT" // needs extension
		}
	}
	writeDebug(debugArrays) {
		const a=JsLines.b()
		if (debugArrays) {
			a("console.log('vertex array byte length:',vertices.byteLength);")
			if (this.usesElements()) {
				a("console.log('element array byte length:',elements.byteLength);")
				a("console.log('vertex+element array byte length:',vertices.byteLength+elements.byteLength);")
			}
		}
		return a.e()
	}
	writeBufferData() {
		const a=JsLines.b()
		a("gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);")
		if (this.usesElements()) {
			a("gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,elements,gl.STATIC_DRAW);")
		}
		return a.e()
	}
	writeArraysAndBufferData(debugArrays) {
		return JsLines.bae(
			this.writeArrays(),
			this.writeDebug(debugArrays),
			this.writeBufferData()
		)
	}
	// public:
	getJsInitLines(featureContext) {
		const writeVertexAttribArrays=(attrs)=>{
			const cmpSize=attrs[0][0]
			const allSameSize=attrs.every((attr)=>{
				var size=attr[0]
				return size==cmpSize
			})
			let allEnabled=true
			const arrayLines=JsLines.bae(...attrs.map(attr=>{
				const size=attr[0], name=attr[1], enabled=attr[2]
				if (enabled) {
					return (allSameSize
						? "'"+name+"',"
						: "["+size+",'"+name+"'],"
					)
				} else {
					allEnabled=false
					return (allSameSize
						? "null,"
						: "["+size+",null],"
					)+" // attribute "+name+" disabled"
				}
			}))
			let foreachEnableLines=JsLines.bae(
				"var attrLoc=gl.getAttribLocation(program,attrName);",
				"gl.vertexAttribPointer(",
				"	attrLoc,attrSize,gl.FLOAT,false,",
				"	Float32Array.BYTES_PER_ELEMENT*bufferStride,",
				"	Float32Array.BYTES_PER_ELEMENT*bufferOffset",
				");",
				"gl.enableVertexAttribArray(attrLoc);"
			)
			if (!allEnabled) {
				foreachEnableLines=WrapLines.b(
					JsLines.bae("if (name!==null) {"),
					JsLines.bae("}")
				).ae(
					foreachEnableLines
				)
			}
			const foreachLines=JsLines.bae(
				...allSameSize?[
					"var attrSize="+cmpSize+";"
				]:[
					"var attrSize=attr[0];",
					"var attrName=attr[1];"
				],
				foreachEnableLines,
				"bufferOffset+=attrSize;"
			)
			return WrapLines.b(
				JsLines.bae(
					"var bufferStride="+this.getNumbersPerVertex()+";",
					"var bufferOffset=0;",
					";["
				),
				JsLines.bae(
					"].forEach(function("+(allSameSize?"attrName":"attr")+"){"
				),
				JsLines.bae(
					"});"
				)
			).ae(
				arrayLines,
				foreachLines
			)
		}
		const a=JsLines.ba(super.getJsInitLines(featureContext))
		if (this.elementIndexBits==32) {
			a("gl.getExtension('OES_element_index_uint');") // TODO check if null is returned and don't allow more elements
		}
		if (this.dim>2) {
			a("gl.enable(gl.DEPTH_TEST);")
		}
		a("gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());")
		if (this.usesElements()) {
			a("gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());")
		}
		a(this.writeArraysAndBufferData(featureContext.debugOptions.arrays))
		if (!this.hasNormals && this.colorAttrs.length<=0) {
			a(
				"var positionLoc=gl.getAttribLocation(program,'position');",
				"gl.vertexAttribPointer(positionLoc,"+this.dim+",gl.FLOAT,false,0,0);",
				"gl.enableVertexAttribArray(positionLoc);"
			)
		} else {
			a(writeVertexAttribArrays([
				[this.dim,'position',true],
				...this.hasNormals?[[3,'normal',true]]:[],
				...this.colorAttrs.map(attr=>[3,attr.name,attr.enabled])
			]))
		}
		return a.e()
	}
	getJsLoopLines(featureContext) {
		const a=JsLines.ba(super.getJsLoopLines(featureContext))
		if (this.usesElements()) {
			a("gl.drawElements(gl."+this.glPrimitive+",nElements,"+this.getElementIndexGlType()+",0);")
		} else {
			a("gl.drawArrays(gl."+this.glPrimitive+",0,nVertices);")
		}
		return a.e()
	}
}

module.exports=Shape
