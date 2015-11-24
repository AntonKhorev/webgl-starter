var Lines=require('../lines.js');
var Shape=require('./shape.js');

var Cube=function(elementIndexBits,shaderType){
	Shape.call(this,elementIndexBits,shaderType);
};
Cube.prototype=Object.create(Shape.prototype);
Cube.prototype.constructor=Cube;
Cube.prototype.dim=3;
Cube.prototype.twoSided=false;
Cube.prototype.usesElements=function(){
	return true;
};
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
		[4, 6, 0, 0, 6, 2],
		[1, 3, 5, 5, 3, 7],
		[0, 1, 4, 4, 1, 5],
		[2, 6, 3, 3, 6, 7],
		[0, 2, 1, 1, 2, 3],
		[5, 7, 4, 4, 7, 6],
	];

	if (!this.usesElements()) {

	} else if (this.shaderType=='face' || this.shaderType=='light') {
		// elements with face data
		var n=this.shaderType=='light';
		return new Lines(
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
		// elements with no face data
		var vertexLines=new Lines;
		vertexLines.a("// x    y    z");
		if (c) {
			vertexLines.t("    r    g    b");
		}
		for (var i=0;i<nCubeVertices;i++) {
			vertexLines.a(cubeVertexPositions[i]);
			if (c) {
				vertexLines.t(cubeVertexColors[i]);
			}
		}
		var elementLines=new Lines;
		for (var i=0;i<nCubeFaces;i++) {
			elementLines.a(cubeFaceVertices[i].join(", ")+", // "+cubeFaceNames[i]+" face");
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
