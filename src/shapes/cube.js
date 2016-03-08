'use strict'

const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const Colorgen=require('../colorgen')
const Shape=require('./shape')

class Cube extends Shape {
	get dim() { return 3 }
	get twoSided() { return false }
	writeArrays() {
		const colorgen=new Colorgen(
			this.colorAttrs,
			0, // TODO remove 'clean' colors after bilinear interp is implemented
			this.hasColorsPerFace?undefined:[
				[0.0, 0.0, 0.0],
				[1.0, 0.0, 0.0],
				[0.0, 1.0, 0.0],
				[1.0, 1.0, 0.0],
				[0.0, 0.0, 1.0],
				[1.0, 0.0, 1.0],
				[0.0, 1.0, 1.0],
				[1.0, 1.0, 1.0],
			]
		)
		const nCubeVertices=8
		const cubeColors=[]
		for (let i=0;i<nCubeVertices;i++) {
			cubeColors.push(colorgen.getNextColorString())
		}
		const cubeVertexPositions=[
			"-0.5,-0.5,-0.5,",
			"+0.5,-0.5,-0.5,",
			"-0.5,+0.5,-0.5,",
			"+0.5,+0.5,-0.5,",
			"-0.5,-0.5,+0.5,",
			"+0.5,-0.5,+0.5,",
			"-0.5,+0.5,+0.5,",
			"+0.5,+0.5,+0.5,",
		]
		const nCubeFaces=6
		const cubeFaceNames=[
			"left",
			"right",
			"bottom",
			"top",
			"back",
			"front",
		]
		const cubeFaceNormals=[
			"-1.0, 0.0, 0.0,",
			"+1.0, 0.0, 0.0,",
			" 0.0,-1.0, 0.0,",
			" 0.0,+1.0, 0.0,",
			" 0.0, 0.0,-1.0,",
			" 0.0, 0.0,+1.0,",
		]
		const cubeFaceVertices=[
			[4, 6, 0, 2],
			[1, 3, 5, 7],
			[0, 1, 4, 5],
			[2, 6, 3, 7],
			[0, 2, 1, 3],
			[5, 7, 4, 6],
		]
		const quadToTriangleMap=[0, 1, 2, 2, 1, 3]
		const vertexCtor=JsLines.b()
		vertexCtor("// x    y    z")
		if (this.hasNormals) {
			vertexCtor.t("  n.x  n.y  n.z")
		}
		vertexCtor.t(colorgen.getHeaderString())
		const appendVertex=(iFace,iVertex,firstInFace)=>{
			vertexCtor(cubeVertexPositions[iVertex])
			if (this.hasNormals) {
				vertexCtor.t(cubeFaceNormals[iFace])
			}
			if (this.hasColorsPerVertex) {
				vertexCtor.t(cubeColors[iVertex])
			} else if (this.hasColorsPerFace) {
				vertexCtor.t(cubeColors[iFace])
			}
			if (firstInFace) {
				vertexCtor.t(" // "+cubeFaceNames[iFace]+" face")
			}
		}
		const wrapVertices=()=>WrapLines.b(
			JsLines.bae("var vertices=new Float32Array(["),
			JsLines.bae("]);")
		).ae(
			vertexCtor.e()
		)
		if (!this.usesElements()) {
			for (let i=0;i<nCubeFaces;i++) {
				quadToTriangleMap.forEach(function(j,k){
					appendVertex(i,cubeFaceVertices[i][j],k==0)
				})
			}
			return JsLines.bae(
				"var nVertices=36;",
				wrapVertices()
			)
		} else if (this.hasColorsPerFace || this.hasNormals) {
			// elements, face data
			for (let i=0;i<nCubeFaces;i++) {
				cubeFaceVertices[i].forEach(function(j,k){
					appendVertex(i,j,k==0)
				})
			}
			return JsLines.bae(
				wrapVertices(),
				"var nElements=36;",
				"var elements=new "+this.getElementIndexJsArray()+"([",
				"	 0,  1,  2,  2,  1,  3, // left face",
				"	 4,  5,  6,  6,  5,  7, // right face",
				"	 8,  9, 10, 10,  9, 11, // bottom face",
				"	12, 13, 14, 14, 13, 15, // top face",
				"	16, 17, 18, 18, 17, 19, // back face",
				"	20, 21, 22, 22, 21, 23, // front face",
				"]);"
			)
		} else {
			// elements, no face data
			for (let i=0;i<nCubeVertices;i++) {
				vertexCtor(cubeVertexPositions[i])
				if (this.hasColorsPerVertex) {
					vertexCtor.t(cubeColors[i])
				}
			}
			const elementCtor=JsLines.b()
			for (let i=0;i<nCubeFaces;i++) {
				elementCtor("")
				quadToTriangleMap.forEach(function(j){
					elementCtor.t(cubeFaceVertices[i][j]+", ")
				})
				elementCtor.t("// "+cubeFaceNames[i]+" face")
			}
			const wrapElements=()=>WrapLines.b(
				JsLines.bae("var elements=new "+this.getElementIndexJsArray()+"(["),
				JsLines.bae("]);")
			).ae(
				elementCtor.e()
			)
			return new Lines(
				wrapVertices(),
				"var nElements=36;",
				wrapElements()
			)
		}
	}
}

module.exports=Cube
