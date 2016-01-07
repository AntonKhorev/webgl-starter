var Lines=require('../lines.js');
var LodShape=require('./lodshape.js');

var Gasket=function(options,hasReflections,hasColorsPerVertex,hasColorsPerFace,colorAttrs){
	LodShape.apply(this,arguments);
};
Gasket.prototype=Object.create(LodShape.prototype);
Gasket.prototype.constructor=Gasket;
Gasket.prototype.getDistinctVertexCount=function(lodSymbol){
	return "(Math.pow(3,"+lodSymbol+"+1)+3)/2";
};
Gasket.prototype.getFaceVertexCount=function(lodSymbol){
	return "Math.pow(3,"+lodSymbol+")*3";
};
Gasket.prototype.getTotalVertexCount=function(lodSymbol){
	return "Math.pow(3,"+lodSymbol+")*3";
};
Gasket.prototype.writeStoreShape=function(){
	var writePushVertex=function(){
		var lines=new Lines;
		lines.a(
			"vertices[nextIndexIntoVertices++]=p[0];",
			"vertices[nextIndexIntoVertices++]=p[1];"
		);
		if (this.hasColorsPerVertex || this.hasColorsPerFace) {
			if (!this.usesElements() || this.hasColorsPerFace) {
				lines.a(
					"colors[nextIndexIntoColors]"
				);
			} else {
				lines.a(
					"colors[nextElement%colors.length]"
				);
			}
			lines.t(
				".forEach(function(cc){",
				"	vertices[nextIndexIntoVertices++]=cc;",
				"});"
			);
		}
		if (this.usesElements()) {
			lines.a(
				"return nextElement++;"
			);
		} else if (this.hasColorsPerVertex) {
			lines.a(
				"nextIndexIntoColors=(nextIndexIntoColors+1)%colors.length;"
			);
		}
		return lines.wrap(
			"function pushVertex(p) {",
			"}"
		);
	}.bind(this);
	var writeTriangle=function(){
		var lines=new Lines;
		lines.a(
			"if (depth<=0) {"
		);
		if (!this.usesElements()) {
			if (this.hasColorsPerFace) {
				lines.a(
					"	pushVertex(p0);",
					"	pushVertex(p1);",
					"	pushVertex(p2);",
					"	nextIndexIntoColors=(nextIndexIntoColors+1)%colors.length;"
				);
			} else {
				lines.a(
					"	pushVertex(p0);",
					"	pushVertex(p1);",
					"	pushVertex(p2);"
				);
			}
		} else {
			if (this.hasColorsPerFace) {
				lines.a(
					"	pushElement(pushVertex(p0));",
					"	pushElement(pushVertex(p1));",
					"	pushElement(pushVertex(p2));",
					"	nextIndexIntoColors=(nextIndexIntoColors+1)%colors.length;"
				);
			} else {
				lines.a(
					"	if (es[0]===null) es[0]=pushVertex(p0);",
					"	if (es[1]===null) es[1]=pushVertex(p1);",
					"	if (es[2]===null) es[2]=pushVertex(p2);",
					"	pushElement(es[0]);",
					"	pushElement(es[1]);",
					"	pushElement(es[2]);",
					"	return es;"
				);
			}
		}
		lines.a(
			"} else {",
			"	var p01=mix(p0,p1);",
			"	var p12=mix(p1,p2);",
			"	var p20=mix(p2,p0);"
		);
		if (!this.usesElements()) {
			lines.a(
				"	triangle(depth-1,p0,p01,p20);",
				"	triangle(depth-1,p1,p12,p01);",
				"	triangle(depth-1,p2,p20,p12);"
			);
		} else if (this.hasColorsPerFace) {
			lines.a(
				"	var es0=triangle(depth-1,p0,p01,p20);",
				"	var es1=triangle(depth-1,p1,p12,p01);",
				"	var es2=triangle(depth-1,p2,p20,p12);"
			);
		} else {
			lines.a(
				"	var es0=triangle(depth-1,p0,p01,p20,[es[0],null,null]);",
				"	var es1=triangle(depth-1,p1,p12,p01,[es[1],null,es0[1]]);",
				"	var es2=triangle(depth-1,p2,p20,p12,[es[2],es0[2],es1[1]]);",
				"	return [es0[0],es1[0],es2[0]];"
			);
		}
		lines.a(
			"}"
		);
		if (!this.usesElements() || this.hasColorsPerFace) {
			return lines.wrap(
				"function triangle(depth,p0,p1,p2) {",
				"}"
			);
		} else {
			return lines.wrap(
				"function triangle(depth,p0,p1,p2,es) {",
				"}"
			);
		}
	}.bind(this);
	var writeInitialTriangleCall=function(){
		var lines=new Lines;
		lines.a(
			"shapeLod,",
			"[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],",
			"[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],",
			"[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]"
		);
		if (this.usesElements() && !this.hasColorsPerFace) {
			lines.t(
				",","[null,null,null]"
			);
		}
		return lines.wrap(
			"triangle(",
			");"
		);
	}.bind(this);
	var lines=new Lines;
	lines.a(
		"var nextIndexIntoVertices=0;"
	);
	if (this.usesElements()) {
		lines.a(
			"var nextIndexIntoElements=0;",
			"var nextElement=0;"
		);
	}
	if (this.hasColorsPerVertex || this.hasColorsPerFace) {
		lines.a("// p = position, cc = color component, e = element, es = elements");
		lines.a(this.writeColorData());
		if (!this.usesElements() || this.hasColorsPerFace) {
			lines.a(
				"var nextIndexIntoColors=0;"
			);
		}
	} else {
		lines.a(
			"// p = position, e = element, es = elements"
		);
	}
	lines.a(writePushVertex());
	if (this.usesElements()) {
		lines.a(
			"function pushElement(e) {",
			"	elements[nextIndexIntoElements++]=e;",
			"}"
		);
	}
	lines.a(
		"function mix(pa,pb) {",
		"	return [",
		"		(pa[0]+pb[0])/2,",
		"		(pa[1]+pb[1])/2,",
		"	];",
		"}",
		writeTriangle(),
		writeInitialTriangleCall()
	);
	return lines;
}

module.exports=Gasket;
