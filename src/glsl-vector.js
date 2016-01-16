'use strict';

const fixOptHelp=require('./fixed-options-helpers.js');
const Lines=require('./lines.js');
const Vector=require('./vector.js');

class GlslVector extends Vector {
	constructor(name,values) {
		super(name,values);
	}
	// public:
	getGlslDeclarationLines() {
		if (this.modeConstant) {
			return new Lines;
		} else if (this.modeFloats) {
			const lines=new Lines;
			this.values.forEach((v,c)=>{
				if (this.isVariableComponent(v)) {
					lines.a(
						"uniform float "+this.varNameC(c)+";"
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
		return this.getGlslComponentsValue(this.values.map((v,c)=>c).join(''));
	}
	getGlslComponentsValue(selectedComponents) {
		const results=[]; // [[isConstant,componentName]]
		const showResult=result=>{
			if (result[0]) {
				return fixOptHelp.formatNumber(this.values[result[1]]);
			} else {
				if (this.modeVector) {
					const resultPartEqualToWholeVector=result[1]==this.values.map((v,c)=>c).slice(0,this.nVars).join('');
					if (resultPartEqualToWholeVector) {
						return this.varName;
					} else {
						return this.varName+"."+result[1];
					}
				} else {
					return this.varNameC(result[1]);
				}
			}
		};
		const allSameConstant=()=>{
			if (!results[0][0]) return false;
			const cmp=fixOptHelp.formatNumber(this.values[results[0][1]]);
			return results.every(result=>(result[0] && fixOptHelp.formatNumber(this.values[result[1]])==cmp));
		};
		for (let j=0;j<selectedComponents.length;j++) {
			const c=selectedComponents.charAt(j);
			if (!this.isVariableComponent(this.values[c])) {
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
			if (this.modeVector && selectedComponents==this.values.map((v,c)=>c).slice(0,this.nVars).join('')) {
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
		if (this.values.length>1) {
			return new Lines(
				"vec"+this.values.length+" "+mapName+"="+mapFn(this.getGlslValue())+";"
			);
		} else {
			return new Lines(
				"float "+mapName+this.values.map((v,c)=>c)[0]+"="+mapFn(this.getGlslValue())+";"
			);
		}
	}
	getGlslMapComponentValue(mapName,selectedComponent) {
		if (this.values.length>1) {
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
			this.values.forEach((v,c)=>{
				if (this.isVariableComponent(v)) {
					lines.a(
						"var "+this.varNameC(c)+"Loc=gl.getUniformLocation(program,'"+this.varNameC(c)+"');"
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
			if (this.values.every(v=>v.input!='slider')) { // all values are short, no getElement... queries
				this.values.forEach((v,c)=>{
					if (this.isVariableComponent(v)) {
						lines.t(
							","+componentValue(v,c)
						);
					}
				});
				lines.t(
					");"
				);
			} else {
				this.values.forEach((v,c)=>{
					if (this.isVariableComponent(v)) {
						lines.t(
							",",
							"	"+componentValue(v,c)
						);
					}
				});
				lines.a(
					");"
				);
			}
		} else {
			this.values.forEach((v,c)=>{
				if (this.isVariableComponent(v)) {
					lines.a(
						"gl.uniform1f("+this.varNameC(c)+"Loc,"+componentValue(v,c)+");"
					);
				}
			});
		}
		return lines;
	}
	addPostToListenerEntryForComponent(entry,c) {
		if (this.modeVector) {
			// written at the end as a vector
		} else {
			entry.post("gl.uniform1f("+this.varNameC(c)+"Loc,"+this.varNameC(c)+");");
		}
	}
	addPostToListenerEntryAfterComponents(entry,componentValue) {
		if (this.modeVector) {
			const vs=[];
			this.values.forEach((v,c,i)=>{
				if (i<this.nVars) {
					vs.push(this.varNameC(c));
				}
			});
			entry.post("gl.uniform"+this.nVars+"f("+this.varName+"Loc,"+vs.join(",")+");");
		}
	}
}

module.exports=GlslVector;
