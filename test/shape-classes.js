'use strict'

const assert=require('assert')
const syntaxCheck=require('syntax-error')
const Options=require('../src/options')
const FeatureContext=require('../src/feature-context')
const Shape=require('../src/shape-classes')

const testJsLinesValidity=(shapeType,jsLinesFnName)=>{
	const options=new Options({
		shape: {
			type: shapeType,
		},
	}).fix()
	const featureContext=new FeatureContext(false)
	const shape=new Shape[shapeType](
		options.shape,false,false,false,
		[{name:"color",enabled:true,weight:1.0}]
	)
	const lines=shape[jsLinesFnName](featureContext)
	const code=lines.get().join('\n')
	const err=syntaxCheck(code)
	assert.equal(err,undefined,String(err))
}

;['square','triangle','gasket','cube','hat','terrain'].forEach(shapeType=>{
	describe("Shape."+shapeType,()=>{
		it("writes valid init lines",()=>{
			testJsLinesValidity(shapeType,'getJsInitLines')
		})
		it("writes valid loop lines",()=>{
			testJsLinesValidity(shapeType,'getJsLoopLines')
		})
	})
})
