'use strict';

const fixOptHelp=require('./fixed-options-helpers.js');
const Lines=require('./lines.js');
const Vector=require('./vector.js');

class GlslVector extends Vector {
	constructor(name,values,wrapMode) {
		super(name,values,wrapMode);
	}
	// public:
	getGlslDeclarationLines() {
		if (this.modeConstant) {
			return new Lines;
		} else if (this.modeFloats) {
			const lines=new Lines;
			this.components.forEach(component=>{
				if (component.variable) {
					lines.a(
						"uniform float "+component.varName+";"
					);
				}
			});
			return lines;
		} else {
			return new Lines(
				"uniform vec"+this.nVars+" "+this.varName+";"
			);
		}
	}
	getGlslValue() {
		return this.getGlslComponentsValue(this.components.map(component=>component.suffix).join(''));
	}
	getGlslComponentsValue(selectedComponents) {
		const allSuffixString=this.components.map(component=>component.suffix).slice(0,this.nVars).join('');
		const results=[]; // [[isConstant,componentName]]
		const showResult=result=>{
			if (result[0]) {
				return fixOptHelp.formatNumber(this.componentsByName[result[1]].value);
			} else {
				if (this.modeVector) {
					if (result[1]==allSuffixString) {
						return this.varName;
					} else {
						return this.varName+"."+result[1];
					}
 				} else {
					return this.componentsByName[result[1]].varName;
 				}
			}
		};
		const allSameConstant=()=>{
			if (!results[0][0]) return false;
			const cmp=fixOptHelp.formatNumber(this.componentsByName[results[0][1]].value);
			return results.every(result=>(result[0] && fixOptHelp.formatNumber(this.componentsByName[result[1]].value)==cmp));
		};
		for (let j=0;j<selectedComponents.length;j++) {
			const c=selectedComponents.charAt(j);
			if (!this.componentsByName[c].variable) {
				results.push([true,c]);
			} else {
				if (this.modeVector && results.length>0) {
					const prevResult=results.pop();
					if (prevResult[0]) {
						results.push(prevResult,[false,c]); // prev is constant, don't merge
					} else {
						results.push([prevResult[0],prevResult[1]+c]); // merge
					}
				} else {
					results.push([false,c]);
				}
			}
		}
		if (results.length==1) {
			if (this.modeVector && selectedComponents==allSuffixString) {
				return this.varName;
			} else {
				return showResult(results[0]);
			}
		} else {
			if (allSameConstant()) {
				return "vec"+selectedComponents.length+"("+showResult(results[0])+")"; // see OpenGL ES SL section 5.4.2
			} else {
				return "vec"+selectedComponents.length+"("+results.map(showResult).join(",")+")";
			}
		}
	}
	getGlslMapDeclarationLines(mapName,mapFn) {
		if (this.components.length>1) {
			return new Lines(
				"vec"+this.components.length+" "+mapName+"="+mapFn(this.getGlslValue())+";"
			);
		} else {
			return new Lines(
				"float "+mapName+this.components[0].suffix+"="+mapFn(this.getGlslValue())+";"
			);
		}
	}
	getGlslMapComponentValue(mapName,selectedComponent) {
		if (this.components.length>1) {
			return mapName+"."+selectedComponent;
		} else {
			return mapName+selectedComponent;
		}
	}
	// private:
	getJsDeclarationLines() {
		const lines=new Lines;
		if (this.modeConstant) {
			return lines;
		}
		if (this.modeFloats) {
			this.components.forEach(component=>{
				if (component.variable) {
					lines.a(
						"var "+component.varNameLoc+"=gl.getUniformLocation(program,'"+component.varName+"');"
					);
				}
			});
		} else {
			lines.a(
				"var "+this.varName+"Loc=gl.getUniformLocation(program,'"+this.varName+"');"
			);
		}
		return lines;
	}
	getJsUpdateLines(componentValue) {
		const lines=new Lines;
		if (this.modeVector) {
			lines.a(
				"gl.uniform"+this.nVars+"f("+this.varName+"Loc"
			);
			if (this.components.every(component=>component.value.input!='slider')) { // all values are short, no getElement... queries
				this.components.forEach(component=>{
					if (component.variable) {
						lines.t(
							","+componentValue(component)
						);
					}
				});
				lines.t(
					");"
				);
			} else {
				this.components.forEach(component=>{
					if (component.variable) {
						lines.t(
							",",
							"	"+componentValue(component)
						);
					}
				});
				lines.a(
					");"
				);
			}
		} else {
			this.components.forEach(component=>{
				if (component.variable) {
					lines.a(
						"gl.uniform1f("+component.varNameLoc+","+componentValue(component)+");"
					);
				}
			});
		}
		return lines;
	}
	addPostToListenerEntryForComponent(entry,component) {
		if (this.modeVector) {
			// written at the end as a vector
		} else {
			entry.post("gl.uniform1f("+component.varNameLoc+","+component.varName+");");
		}
	}
	addPostToListenerEntryAfterComponents(entry,componentValue) {
		if (this.modeVector) {
			const vs=[];
			this.components.forEach((component,i)=>{
				if (i<this.nVars) {
					vs.push(component.varName);
				}
			});
			entry.post("gl.uniform"+this.nVars+"f("+this.varName+"Loc,"+vs.join(",")+");");
		}
	}
}

module.exports=GlslVector;
