'use strict'

const assert=require('assert')
const syntaxCheck=require('syntax-error')
const glslTokenizer=require('glsl-tokenizer/string')
const glslParser=require('glsl-parser/direct')
const Options=require('../src/options')
const FeatureContext=require('../src/feature-context')
const Canvas=require('../src/canvas')

const testGlslLinesValidity=(fnName)=>{
	const options=new Options().fix()
	const featureContext=new FeatureContext(false)
	const canvas=new Canvas(options.canvas)
	const lines=canvas[fnName](featureContext)
	const code=lines.get().join('\n')
	const tokens=glslTokenizer(code)
	const ast=glslParser(tokens)
}
const testJsLinesValidity=(fnName)=>{
	const options=new Options().fix()
	const featureContext=new FeatureContext(false)
	const canvas=new Canvas(options.canvas)
	const lines=canvas[fnName](featureContext)
	const code=lines.get().join('\n')
	const err=syntaxCheck(code)
	assert.equal(err,undefined,String(err))
}
describe("Canvas",()=>{
	it("writes valid glsl vertex declaration lines",()=>{
		testGlslLinesValidity('getGlslVertexDeclarationLines')
	})
	it("writes valid glsl vertex output lines",()=>{
		testGlslLinesValidity('getGlslVertexOutputLines')
	})
	it("writes valid js init lines",()=>{
		testJsLinesValidity('getJsInitLines')
	})
	it("writes valid js loop lines",()=>{
		testJsLinesValidity('getJsLoopLines')
	})
})
