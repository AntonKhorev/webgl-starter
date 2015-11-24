var Lines=require('../lines.js');
var Shape=require('./shape.js');

var Triangle=function(elementIndexBits,shaderType){
	Shape.call(this,elementIndexBits,shaderType);
};
Triangle.prototype=Object.create(Shape.prototype);
Triangle.prototype.constructor=Triangle;
Triangle.prototype.writeArrays=function(c,cv){
	var lines=new Lines(
		"var nVertices=3;",
		"var vertices=new Float32Array([",
		"	//                   x                      y"+(c?"    r    g    b":""),
		"	-Math.sin(0/3*Math.PI), Math.cos(0/3*Math.PI),"+(c?cv?" 1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	-Math.sin(2/3*Math.PI), Math.cos(2/3*Math.PI),"+(c?cv?" 0.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	-Math.sin(4/3*Math.PI), Math.cos(4/3*Math.PI),"+(c?cv?" 0.0, 0.0, 1.0,":" 1.0, 0.0, 0.0,":""),
		"]);"
	);
	if (this.usesElements()) {
		lines.a(
			"var nElements=3;",
			"var elements=new "+this.getElementIndexJsArray()+"([0,1,2]);"
		);
	}
	return lines;
};

module.exports=Triangle;
