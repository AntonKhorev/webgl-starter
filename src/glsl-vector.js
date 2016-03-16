'use strict'

const fixOptHelp=require('./fixed-options-helpers')
const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const Vector=require('./vector')

class GlslVector extends Vector {
	constructor(name,values,wrapRange) {
		super(name,values,wrapRange)
	}
	// public:
	getGlslDeclarationLines() {
		if (this.modeConstant) {
			return Lines.be()
		} else if (this.modeFloats) {
			const a=Lines.b()
			this.components.forEach(component=>{
				if (component.variable) {
					a("uniform float "+component.varName+";")
				}
			})
			return a.e()
		} else {
			return Lines.bae(
				"uniform vec"+this.nVars+" "+this.varName+";"
			)
		}
	}
	getGlslValue() {
		return this.getGlslComponentsValue(this.components.map(component=>component.suffix).join(''))
	}
	getGlslComponentsValue(selectedComponents) {
		const allSuffixString=this.components.map(component=>component.suffix).slice(0,this.nVars).join('')
		const results=[] // [[isConstant,componentName]]
		const showResult=result=>{
			if (result[0]) {
				return fixOptHelp.formatNumber(this.componentsBySuffix[result[1]].value)
			} else {
				if (this.modeVector) {
					if (result[1]==allSuffixString) {
						return this.varName
					} else {
						return this.varName+"."+result[1]
					}
 				} else {
					return this.componentsBySuffix[result[1]].varName
 				}
			}
		}
		const allSameConstant=()=>{
			if (!results[0][0]) return false
			const cmp=fixOptHelp.formatNumber(this.componentsBySuffix[results[0][1]].value)
			return results.every(result=>(result[0] && fixOptHelp.formatNumber(this.componentsBySuffix[result[1]].value)==cmp))
		}
		for (let j=0;j<selectedComponents.length;j++) {
			const c=selectedComponents.charAt(j)
			if (!this.componentsBySuffix[c].variable) {
				results.push([true,c])
			} else {
				if (this.modeVector && results.length>0) {
					const prevResult=results.pop()
					if (prevResult[0]) {
						results.push(prevResult,[false,c]) // prev is constant, don't merge
					} else {
						results.push([prevResult[0],prevResult[1]+c]) // merge
					}
				} else {
					results.push([false,c])
				}
			}
		}
		if (results.length==1) {
			if (this.modeVector && selectedComponents==allSuffixString) {
				return this.varName
			} else {
				return showResult(results[0])
			}
		} else {
			if (allSameConstant()) {
				return "vec"+selectedComponents.length+"("+showResult(results[0])+")" // see OpenGL ES SL section 5.4.2
			} else {
				return "vec"+selectedComponents.length+"("+results.map(showResult).join(",")+")"
			}
		}
	}
	getGlslMapDeclarationLines(mapName,mapFn) {
		if (this.components.length>1) {
			return Lines.bae(
				"vec"+this.components.length+" "+mapName+"="+mapFn(this.getGlslValue())+";"
			)
		} else {
			return Lines.bae(
				"float "+mapName+this.components[0].suffix+"="+mapFn(this.getGlslValue())+";"
			)
		}
	}
	getGlslMapComponentValue(mapName,selectedComponent) {
		if (this.components.length>1) {
			return mapName+"."+selectedComponent
		} else {
			return mapName+selectedComponent
		}
	}
	// private:
	getJsDeclarationLines() {
		const a=JsLines.b()
		if (this.modeConstant) {
			return a.e()
		}
		if (this.modeFloats) {
			this.components.forEach(component=>{
				if (component.variable) {
					a("var "+component.varNameLoc+"=gl.getUniformLocation(program,'"+component.varName+"');")
				}
			})
		} else {
			a("var "+this.varName+"Loc=gl.getUniformLocation(program,'"+this.varName+"');")
		}
		return a.e()
	}
	getJsUpdateLines(componentValue) {
		const a=JsLines.b()
		if (this.modeVector) {
			a("gl.uniform"+this.nVars+"f("+this.varName+"Loc")
			if (this.components.every(component=>component.value.input!='slider')) { // all values are short, no getElement... queries
				this.components.forEach(component=>{
					if (component.variable) {
						a.t(","+componentValue(component))
					}
				})
				a.t(");")
			} else {
				this.components.forEach(component=>{
					if (component.variable) {
						a.t(
							",",
							"	"+componentValue(component)
						)
					}
				})
				a(");")
			}
		} else {
			this.components.forEach(component=>{
				if (component.variable) {
					a("gl.uniform1f("+component.varNameLoc+","+componentValue(component)+");")
				}
			})
		}
		return a.e()
	}
	addPostToListenerEntryForComponent(entry,component) {
		if (this.modeVector) {
			// written at the end as a vector
		} else {
			entry.post("gl.uniform1f("+component.varNameLoc+","+component.varName+");")
		}
	}
	addPostToListenerEntryAfterComponents(entry,componentValue) {
		if (this.modeVector) {
			const vs=[]
			this.components.forEach((component,i)=>{
				if (i<this.nVars) {
					vs.push(component.varName)
				}
			})
			entry.post("gl.uniform"+this.nVars+"f("+this.varName+"Loc,"+vs.join(",")+");")
		}
	}
}

module.exports=GlslVector
