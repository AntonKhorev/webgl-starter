var Lines=require('../lines.js');
var LodShape=require('./lodshape.js');

var Gasket=function(elementIndexBits,shaderType,lod){
	LodShape.call(this,elementIndexBits,shaderType,lod);
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
Gasket.prototype.writeStoreShapeWithElements=function(c,cv){
	function writePushVertex() {
		var lines=new Lines;
		lines.a(
			"vertices[nextIndexIntoVertices++]=p[0];",
			"vertices[nextIndexIntoVertices++]=p[1];"
		);
		if (c) {
			if (this.shaderType=='face') {
				lines.a(
					"var c=colors[nextIndexIntoColors];"
				);
			} else {
				lines.a(
					"var c=colors[nextElement%colors.length];"
				);
			}
			lines.a(
				"vertices[nextIndexIntoVertices++]=c[0];",
				"vertices[nextIndexIntoVertices++]=c[1];",
				"vertices[nextIndexIntoVertices++]=c[2];"
			);
		}
		lines.a(
			"return nextElement++;"
		);
		return lines.wrap(
			"function pushVertex(p) {",
			"}"
		);
	}
	function writeTriangle() {
		var lines=new Lines;
		lines.a(
			"if (depth<=0) {"
		);
		if (this.shaderType=='face') {
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
		lines.a(
			"} else {",
			"	var p01=mix(p0,p1);",
			"	var p12=mix(p1,p2);",
			"	var p20=mix(p2,p0);"
		);
		if (this.shaderType=='face') {
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
		if (this.shaderType=='face') {
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
	}
	function writeInitialTriangleCall() {
		var lines=new Lines;
		lines.a(
			"shapeLod,",
			"[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],",
			"[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],",
			"[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]"
		);
		if (this.shaderType!='face') {
			lines.t(
				",","[null,null,null]"
			);
		}
		return lines.wrap(
			"triangle(",
			");"
		);
	}
	var lines=new Lines;
	lines.a(
		"var nextIndexIntoVertices=0;",
		"var nextIndexIntoElements=0;",
		"var nextElement=0;"
	);
	if (c) {
		lines.a(
			"// p = position, c = color, e = element, es = elements",
			"var colors=[",
			"	[1.0, 0.0, 0.0],",
			"	[0.0, 1.0, 0.0],",
			"	[0.0, 0.0, 1.0],",
			"	[1.0, 1.0, 0.0],",
			"];"
		);
		if (this.shaderType=='face') {
			lines.a(
				"var nextIndexIntoColors=0;"
			);
		}
	} else {
		lines.a(
			"// p = position, e = element, es = elements"
		);
	}
	lines.a(
		writePushVertex.call(this),
		"function pushElement(e) {",
		"	elements[nextIndexIntoElements++]=e;",
		"}",
		"function mix(pa,pb) {",
		"	return [",
		"		(pa[0]+pb[0])/2,",
		"		(pa[1]+pb[1])/2,",
		"	];",
		"}",
		writeTriangle.call(this),
		writeInitialTriangleCall.call(this)
	);
	return lines;
}
Gasket.prototype.writeStoreShapeWithoutElements=function(c,cv){
	var lines=new Lines;
	lines.a(
		"var iv=0;"
	);
	if (this.shaderType=='face') {
		lines.a(
			"var ic=0;",
			"var colors=[",
			"	[1.0, 0.0, 0.0],",
			"	[0.0, 1.0, 0.0],",
			"	[0.0, 0.0, 1.0],",
			"	[1.0, 1.0, 0.0],",
			"];"
		);
	}
	if (this.shaderType=='vertex') {
		lines.a(
			"function pushVertex(v,r,g,b) {",
			"	vertices[iv++]=v[0]; vertices[iv++]=v[1];",
			"	vertices[iv++]=r; vertices[iv++]=g; vertices[iv++]=b;",
			"}"
		);
	} else if (this.shaderType=='face') {
		lines.a(
			"function pushVertex(v,c) {",
			"	vertices[iv++]=v[0]; vertices[iv++]=v[1];",
			"	vertices[iv++]=c[0]; vertices[iv++]=c[1]; vertices[iv++]=c[2];",
			"}"
		);
	} else {
		lines.a(
			"function pushVertex(v) {",
			"	vertices[iv++]=v[0]; vertices[iv++]=v[1];",
			"}"
		);
	}
	lines.a(
		"function mix(a,b,m) {",
		"	return [",
		"		a[0]*(1-m)+b[0]*m,",
		"		a[1]*(1-m)+b[1]*m,",
		"	];",
		"}",
		"function triangle(depth,a,b,c) {",
		"	if (depth<=0) {"
	);
	if (this.shaderType=='vertex') {
		lines.a(
			"		pushVertex(a,1.0,0.0,0.0);",
			"		pushVertex(b,0.0,1.0,0.0);",
			"		pushVertex(c,0.0,0.0,1.0);"
		);
	} else if (this.shaderType=='face') {
		lines.a(
			"		pushVertex(a,colors[ic]);",
			"		pushVertex(b,colors[ic]);",
			"		pushVertex(c,colors[ic]);",
			"		ic=(ic+1)%colors.length;"
		);
	} else {
		lines.a(
			"		pushVertex(a);",
			"		pushVertex(b);",
			"		pushVertex(c);"
		);
	}
	lines.a(
		"	} else {",
		"		var ab=mix(a,b,0.5);",
		"		var bc=mix(b,c,0.5);",
		"		var ca=mix(c,a,0.5);",
		"		triangle(depth-1,a,ab,ca);",
		"		triangle(depth-1,b,bc,ab);",
		"		triangle(depth-1,c,ca,bc);",
		"	}",
		"}",
		"triangle(",
		"	shapeLod,",
		"	[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],",
		"	[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],",
		"	[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]",
		");"
	);
	return lines;
};
Gasket.prototype.writeStoreShape=function(c,cv){
	if (this.usesElements()) {
		return this.writeStoreShapeWithElements(c,cv);
	} else {
		return this.writeStoreShapeWithoutElements(c,cv);
	}
};

module.exports=Gasket;
