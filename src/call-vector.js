'use strict'

const fixOptHelp=require('./fixed-options-helpers')
const JsLines=require('crnx-base/js-lines')
const Vector=require('./vector')

class CallVector extends Vector {
	constructor(name,values,calledFn,calledFnDefaultArgs) {
		super(name,values)
		this.calledFn=calledFn
		this.calledFnDefaultArgs=calledFnDefaultArgs
	}
	// private:
	getJsUpdateLines(componentValue) {
		const a=JsLines.b()
		let nValueSliders=0
		this.components.forEach(component=>{
			nValueSliders+=component.value.input=='slider'
		})
		if (this.modeConstant && this.components.every((component,i)=>component.value==this.calledFnDefaultArgs[i])) {
			// equal to default values, don't do anything
		} else if (nValueSliders<=1) {
			a(this.calledFn+"("+this.components.map(componentValue).join(",")+");")
		} else if (this.components.every(component=>component.value.input=='slider')) {
			let obj=this.calledFn
			const dotIndex=obj.lastIndexOf('.')
			if (dotIndex>=0) {
				obj=obj.slice(0,dotIndex)
			}
			const suffixArray="["+this.components.map(component=>"'"+component.suffix+"'").join(",")+"]"
			a(
				this.calledFn+".apply("+obj+","+suffixArray+".map(function(c){",
				"	return parseFloat(document.getElementById('"+this.name+".'+c).value);",
				"}));"
			)
		} else {
			a(this.calledFn+"(")
			this.components.forEach((component,i)=>{
				if (i>0) {
					a.t(",")
				}
				a(
					"	"+componentValue(component)
				)
			})
			a(
				");"
			)
		}
		return a.e()
	}
	addPostToListenerEntryAfterComponents(entry,componentValue) {
		entry.post(
			this.calledFn+"("+this.components.map(componentValue).join(",")+");"
		)
	}
}

module.exports=CallVector
