'use strict';

const Lines=require('./lines.js');
const Vector=require('./vector.js');

const GlslVector=function(name,values){
	Vector.apply(this,arguments);
};
GlslVector.prototype=Object.create(Vector.prototype);
GlslVector.prototype.constructor=GlslVector;
// public:
GlslVector.prototype.getGlslDeclarationLines=function(){
	if (this.modeConstant) {
		return new Lines;
	} else if (this.modeFloats) {
		const lines=new Lines;
		this.values.forEach((v,c)=>{
			if (v.input=='constant') return;
			lines.a(
				"uniform float "+this.varNameC(c)+";"
			);
		});
		return lines;
	} else {
		return new Lines(
			"uniform vec"+this.nVars+" "+this.name+";"
		);
	}
};
GlslVector.prototype.getGlslValue=function(){
	const vecType="vec"+this.values.length;
	let vs=this.values.map((v,c)=>{
		if (v.input=='constant') {
			return this.formatValue(v);
		} else {
			return this.varNameC(c);
		}
	});
	if (this.modeConstant) {
		const equalValues=vs.every(function(v){
			return v==vs[0];
		});
		if (equalValues) {
			return vecType+"("+vs[0]+")"; // see OpenGL ES SL section 5.4.2
		} else {
			return vecType+"("+vs.join(",")+")";
		}
	} else if (!this.modeFloats) {
		vs=vs.slice(this.nVars);
		if (vs.length==0) {
			return this.name;
		}
		vs.unshift(this.name);
	}
	return vecType+"("+vs.join(",")+")";
};
GlslVector.prototype.getGlslComponentsValue=function(selectedComponents){
	const results=[]; // [[isConstant,componentName]]
	const showResult=result=>{
		if (result[0]) {
			return this.formatValue(this.values[result[1]]);
		} else {
			if (this.modeVector) {
				return this.name+"."+result[1];
			} else {
				return this.varNameC(result[1]);
			}
		}
	};
	const allSameConstant=()=>{
		if (!results[0][0]) return false;
		const cmp=this.formatValue(this.values[results[0][1]]);
		return results.every(result=>(result[0] && this.formatValue(this.values[result[1]])==cmp));
	};
	for (let j=0;j<selectedComponents.length;j++) {
		const c=selectedComponents.charAt(j);
		if (this.values[c].input=='constant') {
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
		if (this.modeVector && this.values.every((v,c,i)=>(
			i>=selectedComponents.length || c==selectedComponents.charAt(i)
		))) {
			return this.name;
		} else {
			return showResult(results[0]);
		}
	} else {
		if (allSameConstant()) {
			return "vec"+selectedComponents.length+"("+showResult(results[0])+")";
		} else {
			return "vec"+selectedComponents.length+"("+results.map(showResult).join(",")+")";
		}
	}
};
// private:
GlslVector.prototype.writeJsInterfaceGlslLines=function(){
	const lines=new Lines;
	if (this.modeFloats) {
		this.values.forEach((v,c)=>{
			if (v.input=='constant') return;
			lines.a(
				"var "+this.varNameC(c)+"Loc=gl.getUniformLocation(program,'"+this.varNameC(c)+"');"
			);
		});
	} else {
		lines.a(
			"var "+this.name+"Loc=gl.getUniformLocation(program,'"+this.name+"');"
		);
	}
	if (this.nSliders==0 && this.modeVector) {
		lines.a(
			"gl.uniform"+this.nVars+"f("+this.name+"Loc"
		);
		this.values.forEach(v=>{
			if (v.input!='constant') {
				lines.t(
					","+this.formatValue(v)
				);
			}
		});
		lines.t(
			");"
		);
	} else if (this.nSliders==0) {
		this.values.forEach((v,c)=>{
			if (v.input!='constant') {
				lines.a(
					"gl.uniform1f("+this.varNameC(c)+"Loc,"+this.formatValue(v)+");"
				);
			}
		});
	}
	return lines;
};
GlslVector.prototype.writeJsInterfaceUpdateFnLines=function() {
	const updateFnLines=new Lines;
	if (this.modeFloats) {
		this.values.forEach((v,c)=>{
			if (v.input=='constant') return;
			updateFnLines.a(
				"gl.uniform1f("+this.varNameC(c)+"Loc,"+this.componentValue(v,c)+");"
			);
		});
	} else {
		updateFnLines.a(
			"gl.uniform"+this.nVars+"f("+this.name+"Loc"
		);
		this.values.forEach((v,c)=>{
			if (v.input=='constant') return;
			updateFnLines.t(
				",",
				"	"+this.componentValue(v,c)
			);
		});
		updateFnLines.a(
			");"
		);
	}
	return updateFnLines;
};
GlslVector.prototype.addPostToEntryForComponent=function(entry,c){
	if (this.nSliders==0 && this.modeVector) {
		// written at the end as a vector
	} else if (this.nSliders==0) {
		entry.post("gl.uniform1f("+this.varNameC(c)+"Loc,"+this.varNameC(c)+");");
	} else {
		entry.post(this.updateFnName()+"();");
	}
};
GlslVector.prototype.addPostToEntryAfterComponents=function(entry){
	if (this.nSliders==0 && this.modeVector) {
		const vs=[];
		this.values.forEach((v,c,i)=>{
			if (i<this.nVars) {
				vs.push(this.varNameC(c));
			}
		});
		entry.post("gl.uniform"+this.nVars+"f("+this.name+"Loc,"+vs.join(",")+");");
	}
};

module.exports=GlslVector;
