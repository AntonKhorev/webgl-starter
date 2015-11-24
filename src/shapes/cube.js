var Lines=require('../lines.js');
var Shape=require('./shape.js');

var Cube=function(elementIndexBits,shaderType){
	Shape.call(this,elementIndexBits,shaderType);
};
Cube.prototype=Object.create(Shape.prototype);
Cube.prototype.constructor=Cube;
Cube.prototype.dim=3;
Cube.prototype.twoSided=false;
Cube.prototype.writeArrays=function(c,cv){
	var nCubeVertices=8;
	var cubeVertexPositions=[
		"-0.5,-0.5,-0.5,",
		"+0.5,-0.5,-0.5,",
		"-0.5,+0.5,-0.5,",
		"+0.5,+0.5,-0.5,",
		"-0.5,-0.5,+0.5,",
		"+0.5,-0.5,+0.5,",
		"-0.5,+0.5,+0.5,",
		"+0.5,+0.5,+0.5,",
	];
	var cubeVertexColors=[
		" 0.0, 0.0, 0.0,",
		" 1.0, 0.0, 0.0,",
		" 0.0, 1.0, 0.0,",
		" 1.0, 1.0, 0.0,",
		" 0.0, 0.0, 1.0,",
		" 1.0, 0.0, 1.0,",
		" 0.0, 1.0, 1.0,",
		" 1.0, 1.0, 1.0,",
	];
	var nCubeFaces=6;
	var cubeFaceNames=[
		"left",
		"right",
		"bottom",
		"top",
		"back",
		"front",
	];
	var cubeFaceNormals=[
		"-1.0, 0.0, 0.0,",
		"+1.0, 0.0, 0.0,",
		" 0.0,-1.0, 0.0,",
		" 0.0,+1.0, 0.0,",
		" 0.0, 0.0,-1.0,",
		" 0.0, 0.0,+1.0,",
	];
	var cubeFaceColors=[
		" 1.0, 0.0, 0.0,",
		" 0.0, 1.0, 0.0,",
		" 1.0, 1.0, 0.0,",
		" 0.0, 0.0, 1.0,",
		" 1.0, 0.0, 1.0,",
		" 0.0, 1.0, 1.0,",
	];
	var cubeFaceVertices=[
		[4, 6, 0, 2],
		[1, 3, 5, 7],
		[0, 1, 4, 5],
		[2, 6, 3, 7],
		[0, 2, 1, 3],
		[5, 7, 4, 6],
	];
	var quadToTriangleMap=[0, 1, 2, 2, 1, 3];
	var vertexLines=new Lines;
	vertexLines.a("// x    y    z");
	if (this.shaderType=='light') {
		vertexLines.t("  n.x  n.y  n.z");
	}
	if (c) {
		vertexLines.t("    r    g    b");
	}
	function appendVertex(iFace,iVertex,firstInFace) {
		vertexLines.a(cubeVertexPositions[iVertex]);
		if (this.shaderType=='light') {
			vertexLines.t(cubeFaceNormals[iFace]);
		}
		if (this.shaderType=='vertex') {
			vertexLines.t(cubeVertexColors[iVertex]);
		}
		if (this.shaderType=='face') {
			vertexLines.t(cubeFaceColors[iFace]);
		}
		if (firstInFace) {
			vertexLines.t(" // "+cubeFaceNames[iFace]+" face");
		}
	}
	if (!this.usesElements()) {
		for (var i=0;i<nCubeFaces;i++) {
			quadToTriangleMap.forEach(function(j,k){
				appendVertex.call(this,i,cubeFaceVertices[i][j],k==0);
			},this);
		}
		return new Lines(
			"var nVertices=36;",
			vertexLines.wrap(
				"var vertices=new Float32Array([",
				"]);"
			)
		);
	} else if (this.shaderType=='face' || this.shaderType=='light') {
		// elements, face data
		for (var i=0;i<nCubeFaces;i++) {
			cubeFaceVertices[i].forEach(function(j,k){
				appendVertex.call(this,i,j,k==0);
			},this);
		}
		return new Lines(
			vertexLines.wrap(
				"var vertices=new Float32Array([",
				"]);"
			),
			"var nElements=36;",
			"var elements=new "+this.getElementIndexJsArray()+"([",
			"	 0,  1,  2,  2,  1,  3, // left face",
			"	 4,  5,  6,  6,  5,  7, // right face",
			"	 8,  9, 10, 10,  9, 11, // bottom face",
			"	12, 13, 14, 14, 13, 15, // top face",
			"	16, 17, 18, 18, 17, 19, // back face",
			"	20, 21, 22, 22, 21, 23, // front face",
			"]);"
		);
	} else {
		// elements, no face data
		for (var i=0;i<nCubeVertices;i++) {
			vertexLines.a(cubeVertexPositions[i]);
			if (c) {
				vertexLines.t(cubeVertexColors[i]);
			}
		}
		var elementLines=new Lines;
		for (var i=0;i<nCubeFaces;i++) {
			elementLines.a("");
			quadToTriangleMap.forEach(function(j){
				elementLines.t(cubeFaceVertices[i][j]+", ");
			});
			elementLines.t("// "+cubeFaceNames[i]+" face");
		}
		return new Lines(
			vertexLines.wrap(
				"var vertices=new Float32Array([",
				"]);"
			),
			"var nElements=36;",
			elementLines.wrap(
				"var elements=new "+this.getElementIndexJsArray()+"([",
				"]);"
			)
		);
	}
};

module.exports=Cube;
