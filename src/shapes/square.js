var Lines=require('../lines.js');
var Shape=require('./shape.js');

var Square=function(elementIndexBits,shaderType){
	Shape.call(this,elementIndexBits,shaderType);
};
Square.prototype=Object.create(Shape.prototype);
Square.prototype.constructor=Square;
Square.prototype.glPrimitive='TRIANGLE_FAN';
Square.prototype.writeArrays=function(c,cv){
	var lines=new Lines(
		"var nVertices=4;",
		"var vertices=new Float32Array([",
		"	// x    y"+(c?   "    r    g    b":""),
		"	-0.5,-0.5,"+(c?cv?" 1.0, 0.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	+0.5,-0.5,"+(c?cv?" 0.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"	+0.5,+0.5,"+(c?cv?" 0.0, 0.0, 1.0,":" 1.0, 0.0, 0.0,":""),
		"	-0.5,+0.5,"+(c?cv?" 1.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),
		"]);"
	);
	if (this.usesElements()) {
		lines.a(
			"var nElements=4;",
			"var elements=new "+this.getElementIndexJsArray()+"([0,1,2,3]);"
		);
	}
	return lines;
};

module.exports=Square;
