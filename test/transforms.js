'use strict'

const assert=require('assert')
const Options=require('../src/options')
const Transforms=require('../src/transforms')

describe("Transforms",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['Group','transforms',[
					['Select','projection',['ortho','perspective']],
					['Array','model',[
						['LiveFloat','rotate.x',[-180,+180,-360,+360],0],
						['LiveFloat','rotate.y',[-180,+180,-360,+360],0],
						['LiveFloat','rotate.z',[-180,+180,-360,+360],0],
					]],
				]],
			]
		}
	}
	context("with 1 slider x-rotation",()=>{
		const options=new TestOptions({transforms:{
			model:[
				{type:'rotate.x', input:'slider'},
			]
		}})
		const transforms=new Transforms(options.fix().transforms)
		it("has rotation matrix",()=>{
			const lines=transforms.getGlslVertexOutputLines(true,false,false)
			assert.deepEqual(lines.get(),[
				"float cx=cos(radians(rotateX));",
				"float sx=sin(radians(rotateX));",
				"gl_Position=position*mat4( // rotate around x axis",
				"	  1.0,  0.0,  0.0,  0.0,",
				"	  0.0,   cx,  -sx,  0.0,",
				"	  0.0,   sx,   cx,  0.0,",
				"	  0.0,  0.0,  0.0,  1.0",
				");",
			])
		})
	})
	context("with 2 slider x-rotations",()=>{
		const options=new TestOptions({transforms:{
			model:[
				{type:'rotate.x', input:'slider'},
				{type:'rotate.x', input:'slider'},
			]
		}})
		const transforms=new Transforms(options.fix().transforms)
		it("has 2 declarations of form rotate#X",()=>{
			const lines=transforms.getGlslVertexDeclarationLines(false)
			assert.deepEqual(lines.get(),[
				"uniform float rotate0X;",
				"uniform float rotate1X;",
				"attribute vec4 position;"
			])
		})
	})
})
