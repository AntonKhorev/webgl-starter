'use strict'

const assert=require('assert')
const Options=require('../src/options')
const FeatureContext=require('../src/feature-context')
const Background=require('../src/background')

describe("Background",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['Group','background',[
					['Select','type',['none','solid']],
					['LiveColor','color',[1,1,1,1],{'background.type':'solid'}],
				]],
				['Group','debug',[
					['Checkbox','shaders',true],
					['Checkbox','arrays'],
					['Checkbox','inputs'],
					['Checkbox','animations'],
				]],
			]
		}
	}
	context("with solid background",()=>{
		const options=new TestOptions({background:{
			type:'solid'
		}})
		const fixed=options.fix()
		const background=new Background(fixed.background)
		const featureContext=new FeatureContext(fixed.debug)
		it("calls gl.clearColor",()=>{
			assert.deepEqual(background.getJsInitLines(featureContext).get(),[
				"gl.clearColor(1.000,1.000,1.000,1.000)",
			])
		})
		it("calls gl.clear",()=>{
			assert.deepEqual(background.getJsLoopLines(featureContext).get(),[
				"gl.clear(gl.COLOR_BUFFER_BIT)",
			])
		})
	})
})
