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
	var colorgens=this.colorAttrs.map(function(attr){
		return new Colorgen(attr.weight);
	});
	var writeColorComments=function(){
		return this.colorAttrs.map(function(){
			return "    r    g    b";
		}).join("");
	}.bind(this);
	var colorDataForFace;
	var writeColorDataForVertex=function(){
		return this.colorAttrs.map(function(_,i){
			return colorgens[i].getNextColorString();
		}).join("");
	}.bind(this);
	var writeColorData=function(){
		if (this.hasColorsPerFace && !this.hasColorsPerVertex) {
			if (colorDataForFace===undefined) {
				colorDataForFace=writeColorDataForVertex();
			}
			return colorDataForFace;
		} else {
			return writeColorDataForVertex();
		}
	}.bind(this);
	var lines=new Lines(
		"var nVertices=4;",
		"var vertices=new Float32Array([",
		"	// x    y"+writeColorComments(),
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
