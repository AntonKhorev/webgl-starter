var Lines=require('../lines.js');
var Colorgen=require('../colorgen.js');
var Shape=require('./shape.js');

var Square=function(){
	Shape.apply(this,arguments);
};
Square.prototype=Object.create(Shape.prototype);
Square.prototype.constructor=Square;
Square.prototype.glPrimitive='TRIANGLE_FAN';
Square.prototype.writeArrays=function(){
	var colorgen=new Colorgen(this.colorAttrs);
	var colorDataForFace;
	var writeColorData=function(){
		if (this.hasColorsPerFace && !this.hasColorsPerVertex) {
			if (colorDataForFace===undefined) {
				colorDataForFace=colorgen.getNextColorString();
			}
			return colorDataForFace;
		} else {
			return colorgen.getNextColorString();
		}
	}.bind(this);
	var lines=new Lines(
		"var nVertices=4;",
		"var vertices=new Float32Array([",
		"	// x    y"+colorgen.getHeaderString(),
		"	-0.5,-0.5,"+writeColorData(),
		"	+0.5,-0.5,"+writeColorData(),
		"	+0.5,+0.5,"+writeColorData(),
		"	-0.5,+0.5,"+writeColorData(),
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
