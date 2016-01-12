'use strict';

const Lines=require('../lines.js');
const Feature=require('../feature.js');

class Shape extends Feature {
	constructor(options,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs) {
		super();
		this.elementIndexBits=parseInt(options.elements); // 0 if don't want element arrays; 8, 16 or 32 bits per element index, limits lod of shape
		this.hasNormals=(hasReflections && this.dim==3); // true = need normals, unless shape is flat
		this.hasColorsPerVertex=hasColorsPerVertex; // TODO support for both hasColorsPerVertex and hasColorsPerFace == true
		this.hasColorsPerFace=hasColorsPerFace;
		this.colorAttrs=colorAttrs; // array of color attribute structs {name,enabled,weight}
	}
	get dim() { return 2; }
	get twoSided() { return true; } // triangles can be viewed from both sides
	get glPrimitive() { return 'TRIANGLES'; }
	usesElements() { // TODO convert to getter
		return this.elementIndexBits>0;
	}
	getNumbersPerVertex() {
		return this.dim+(this.hasNormals?3:0)+this.colorAttrs.length*3;
	}
	getElementIndexJsArray() {
		return "Uint"+this.elementIndexBits+"Array";
	}
	getElementIndexGlType() {
		if (this.elementIndexBits==8) {
			return "gl.UNSIGNED_BYTE"; // not recommended by ms [https://msdn.microsoft.com/en-us/library/dn798776%28v=vs.85%29.aspx]
		} else if (this.elementIndexBits==16) {
			return "gl.UNSIGNED_SHORT"; // mozilla examples use this
		} else if (this.elementIndexBits==32) {
			return "gl.UNSIGNED_INT"; // needs extension
		}
	}
	writeDebug(debugArrays) {
		const lines=new Lines;
		if (debugArrays) {
			lines.a("console.log('vertex array byte length:',vertices.byteLength);");
			if (this.usesElements()) {
				lines.a("console.log('element array byte length:',elements.byteLength);");
				lines.a("console.log('vertex+element array byte length:',vertices.byteLength+elements.byteLength);");
			}
		}
		return lines;
	}
	writeBufferData() {
		const lines=new Lines;
		lines.a(
			"gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);"
		);
		if (this.usesElements()) {
			lines.a(
				"gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,elements,gl.STATIC_DRAW);"
			);
		}
		return lines;
	}
	writeArraysAndBufferData(debugArrays) {
		return new Lines(
			this.writeArrays(),
			this.writeDebug(debugArrays),
			this.writeBufferData()
		);
	}
	// public:
	getJsInitLines(featureContext) {
		const lines=super.getJsInitLines(featureContext);
		lines.a(
			"gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());"
		);
		if (this.usesElements()) {
			lines.a(
				"gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());"
			);
		}
		lines.a(
			this.writeArraysAndBufferData(featureContext.debugOptions.arrays)
		);
		const writeVertexAttribArrays=(attrs)=>{
			const cmpSize=attrs[0][0];
			const allSameSize=attrs.every((attr)=>{
				var size=attr[0];
				return size==cmpSize;
			});
			let allEnabled=true;
			const arrayLines=new Lines;
			attrs.forEach((attr)=>{
				const size=attr[0];
				const name=attr[1];
				const enabled=attr[2];
				if (enabled) {
					arrayLines.a(allSameSize
						? "'"+name+"',"
						: "["+size+",'"+name+"'],"
					);
				} else {
					arrayLines.a(allSameSize
						? "null,"
						: "["+size+",null],"
					);
					arrayLines.t(" // attribute "+name+" disabled");
					allEnabled=false;
				}
			});
			const foreachEnableLines=new Lines(
				"var attrLoc=gl.getAttribLocation(program,attrName);",
				"gl.vertexAttribPointer(",
				"	attrLoc,attrSize,gl.FLOAT,false,",
				"	Float32Array.BYTES_PER_ELEMENT*bufferStride,",
				"	Float32Array.BYTES_PER_ELEMENT*bufferOffset",
				");",
				"gl.enableVertexAttribArray(attrLoc);"
			);
			if (!allEnabled) {
				foreachEnableLines.wrap("if (name!==null) {","}");
			}
			const foreachLines=new Lines;
			if (allSameSize) {
				foreachLines.a(
					"var attrSize="+cmpSize+";"
				);
			} else {
				foreachLines.a(
					"var attrSize=attr[0];",
					"var attrName=attr[1];"
				);
			}
			foreachLines.a(
				foreachEnableLines,
				"bufferOffset+=attrSize;"
			);
			lines.a(
				"var bufferStride="+this.getNumbersPerVertex()+";",
				"var bufferOffset=0;",
				arrayLines.wrap("[","]")
			);
			lines.t(
				foreachLines.wrap(".forEach(function("+(allSameSize?"attrName":"attr")+"){","});")
			);
		};
		if (!this.hasNormals && this.colorAttrs.length<=0) {
			lines.a(
				"var positionLoc=gl.getAttribLocation(program,'position');",
				"gl.vertexAttribPointer(positionLoc,"+this.dim+",gl.FLOAT,false,0,0);",
				"gl.enableVertexAttribArray(positionLoc);"
			);
		} else {
			writeVertexAttribArrays(
				[[this.dim,'position',true]].concat(
					this.hasNormals?[[3,'normal',true]]:[],
					this.colorAttrs.map(function(attr){
						return [3,attr.name,attr.enabled];
					})
				)
			);
		}
		return lines;
	}
	getJsLoopLines() {
		const lines=super.getJsLoopLines();
		if (this.usesElements()) {
			lines.a("gl.drawElements(gl."+this.glPrimitive+",nElements,"+this.getElementIndexGlType()+",0);");
		} else {
			lines.a("gl.drawArrays(gl."+this.glPrimitive+",0,nVertices);");
		}
		return lines;
	}
}

module.exports=Shape;
