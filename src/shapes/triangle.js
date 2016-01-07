var Lines=require('../lines.js');
var Colorgen=require('../colorgen.js');
var Shape=require('./shape.js');

var Triangle=function(options,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs){
	Shape.apply(this,arguments);
};
Triangle.prototype=Object.create(Shape.prototype);
Triangle.prototype.constructor=Triangle;
Triangle.prototype.writeArrays=function(){
	var colorgen=new Colorgen(this.colorAttrs,0);
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
		"var nVertices=3;",
		"var vertices=new Float32Array([",
		"	//                   x                      y"+colorgen.getHeaderString(),
		"	-Math.sin(0/3*Math.PI), Math.cos(0/3*Math.PI),"+writeColorData(),
		"	-Math.sin(2/3*Math.PI), Math.cos(2/3*Math.PI),"+writeColorData(),
		"	-Math.sin(4/3*Math.PI), Math.cos(4/3*Math.PI),"+writeColorData(),
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
