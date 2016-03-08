'use strict'

const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const LodShape=require('./lodshape')

class Gasket extends LodShape {
	getDistinctVertexCount(lodSymbol) {
		return "(Math.pow(3,"+lodSymbol+"+1)+3)/2"
	}
	getFaceVertexCount(lodSymbol) {
		return "Math.pow(3,"+lodSymbol+")*3"
	}
	getTotalVertexCount(lodSymbol) {
		return "Math.pow(3,"+lodSymbol+")*3"
	}
	writeStoreShape() {
		const writePushVertex=()=>{
			const a=JsLines.b()
			a(
				"vertices[nextIndexIntoVertices++]=p[0];",
				"vertices[nextIndexIntoVertices++]=p[1];"
			)
			if (this.hasColorsPerVertex || this.hasColorsPerFace) {
				if (!this.usesElements() || this.hasColorsPerFace) {
					a("colors[nextIndexIntoColors]")
				} else {
					a("colors[nextElement%colors.length]")
				}
				a.t(
					".forEach(function(cc){",
					"	vertices[nextIndexIntoVertices++]=cc;",
					"});"
				)
			}
			if (this.usesElements()) {
				a("return nextElement++;")
			} else if (this.hasColorsPerVertex) {
				a("nextIndexIntoColors=(nextIndexIntoColors+1)%colors.length;")
			}
			return a.e()
		}
		const writeTriangle=()=>{
			const a=JsLines.b()
			a(
				"if (depth<=0) {"
			)
			if (!this.usesElements()) {
				if (this.hasColorsPerFace) {
					a(
						"	pushVertex(p0);",
						"	pushVertex(p1);",
						"	pushVertex(p2);",
						"	nextIndexIntoColors=(nextIndexIntoColors+1)%colors.length;"
					)
				} else {
					a(
						"	pushVertex(p0);",
						"	pushVertex(p1);",
						"	pushVertex(p2);"
					)
				}
			} else {
				if (this.hasColorsPerFace) {
					a(
						"	pushElement(pushVertex(p0));",
						"	pushElement(pushVertex(p1));",
						"	pushElement(pushVertex(p2));",
						"	nextIndexIntoColors=(nextIndexIntoColors+1)%colors.length;"
					)
				} else {
					a(
						"	if (es[0]===null) es[0]=pushVertex(p0);",
						"	if (es[1]===null) es[1]=pushVertex(p1);",
						"	if (es[2]===null) es[2]=pushVertex(p2);",
						"	pushElement(es[0]);",
						"	pushElement(es[1]);",
						"	pushElement(es[2]);",
						"	return es;"
					)
				}
			}
			a(
				"} else {",
				"	var p01=mix(p0,p1);",
				"	var p12=mix(p1,p2);",
				"	var p20=mix(p2,p0);"
			)
			if (!this.usesElements()) {
				a(
					"	triangle(depth-1,p0,p01,p20);",
					"	triangle(depth-1,p1,p12,p01);",
					"	triangle(depth-1,p2,p20,p12);"
				)
			} else if (this.hasColorsPerFace) {
				a(
					"	var es0=triangle(depth-1,p0,p01,p20);",
					"	var es1=triangle(depth-1,p1,p12,p01);",
					"	var es2=triangle(depth-1,p2,p20,p12);"
				)
			} else {
				a(
					"	var es0=triangle(depth-1,p0,p01,p20,[es[0],null,null]);",
					"	var es1=triangle(depth-1,p1,p12,p01,[es[1],null,es0[1]]);",
					"	var es2=triangle(depth-1,p2,p20,p12,[es[2],es0[2],es1[1]]);",
					"	return [es0[0],es1[0],es2[0]];"
				)
			}
			a(
				"}"
			)
			return a.e()
		}
		const writeInitialTriangleCall=()=>{
			const a=JsLines.b()
			a(
				"shapeLod,",
				"[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],",
				"[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],",
				"[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]"
			)
			if (this.usesElements() && !this.hasColorsPerFace) {
				a.t(
					",","[null,null,null]"
				)
			}
			return a.e()
		}
		const a=JsLines.b()
		a("var nextIndexIntoVertices=0;")
		if (this.usesElements()) {
			a("var nextIndexIntoElements=0;")
			a("var nextElement=0;")
		}
		if (this.hasColorsPerVertex || this.hasColorsPerFace) {
			a("// p = position, cc = color component, e = element, es = elements")
			a(this.writeColorData())
			if (!this.usesElements() || this.hasColorsPerFace) {
				a("var nextIndexIntoColors=0;")
			}
		} else {
			a("// p = position, e = element, es = elements")
		}
		a(
			WrapLines.b(
				JsLines.bae("function pushVertex(p) {"),
				JsLines.bae("}")
			).ae(
				writePushVertex()
			)
		)
		if (this.usesElements()) {
			a(
				"function pushElement(e) {",
				"	elements[nextIndexIntoElements++]=e;",
				"}"
			)
		}
		a(
			"function mix(pa,pb) {",
			"	return [",
			"		(pa[0]+pb[0])/2,",
			"		(pa[1]+pb[1])/2,",
			"	];",
			"}",
			((!this.usesElements() || this.hasColorsPerFace)
				? WrapLines.b(
					JsLines.bae("function triangle(depth,p0,p1,p2) {"),
					JsLines.bae("}")
				)
				: WrapLines.b(
					JsLines.bae("function triangle(depth,p0,p1,p2,es) {"),
					JsLines.bae("}")
				)
			).ae(
				writeTriangle()
			),
			WrapLines.b(
				JsLines.bae("triangle("),
				JsLines.bae(");")
			).ae(
				writeInitialTriangleCall()
			)
		)
		return a.e()
	}
}

module.exports=Gasket
