'use strict'

const assert=require('assert')
const Options=require('../src/options')
const FeatureContext=require('../src/feature-context')
const GlslVector=require('../src/glsl-vector')

describe("GlslVector",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['Group','foo',[
					['LiveFloat','x',[-4.0,+4.0,-4.0,+4.0],+1.0],
					['LiveFloat','y',[-4.0,+4.0,-4.0,+4.0],+2.0],
					['LiveFloat','z',[-4.0,+4.0,-4.0,+4.0],+3.0],
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
	context("with constant vector",()=>{
		const options=new TestOptions
		const vector=new GlslVector('foo',options.fix().foo.entries)
		it("returns empty declaration",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().get(),[
			])
		})
		it("returns constant vec3 value",()=>{
			assert.equal(vector.getGlslValue(),
				"vec3(1.0,2.0,3.0)"
			)
		})
		it("returns constant vec2 components",()=>{
			assert.equal(vector.getGlslComponentsValue('yz'),
				"vec2(2.0,3.0)"
			)
		})
		it("returns vec3 map declaration",()=>{
			assert.deepEqual(vector.getGlslMapDeclarationLines('ololo',v=>"lol("+v+")").get(),[
				"vec3 ololo=lol(vec3(1.0,2.0,3.0));"
			])
		})
		it("returns vec3 map component",()=>{
			assert.equal(vector.getGlslMapComponentValue('ololo','x'),
				"ololo.x"
			)
		})
		it("returns empty js interface",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
			])
		})
	})
	context("with equal-component constant vector",()=>{
		const options=new TestOptions({foo:{
			x:2.0, y:2.0, z:2.0
		}})
		const vector=new GlslVector('foo',options.fix().foo.entries)
		it("returns empty declaration",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().get(),[
			])
		})
		it("returns constant vec3 with one component as value",()=>{
			assert.equal(vector.getGlslValue(),
				"vec3(2.0)"
			)
		})
		it("returns constant vec2 with one component",()=>{
			assert.equal(vector.getGlslComponentsValue('yz'),
				"vec2(2.0)"
			)
		})
		it("returns empty js interface",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
			])
		})
	})
	context("with 1 first component out of 3 variable vector",()=>{
		const options=new TestOptions({foo:{
			x:{input:'slider'}
		}})
		const vector=new GlslVector('foo',options.fix().foo.entries)
		it("returns float declaration",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().get(),[
				"uniform float fooX;"
			])
		})
		it("returns vec3 made of float and constants as value",()=>{
			assert.equal(vector.getGlslValue(),
				"vec3(fooX,2.0,3.0)"
			)
		})
		it("returns vec2 of float and constant as xy components",()=>{
			assert.equal(vector.getGlslComponentsValue('xy'),
				"vec2(fooX,2.0)"
			)
		})
		it("returns float as x component",()=>{
			assert.equal(vector.getGlslComponentsValue('x'),
				"fooX"
			)
		})
		it("returns interface with 1 location and 1 simple listener",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
				"var fooXLoc=gl.getUniformLocation(program,'fooX')",
				"function updateFoo() {",
				"	gl.uniform1f(fooXLoc,parseFloat(document.getElementById('foo.x').value))",
				"}",
				"updateFoo()",
				"document.getElementById('foo.x').addEventListener('change',updateFoo)"
			])
		})
		it("doesn't write empty mousemove listener code",()=>{
			const featureContext=new FeatureContext(false)
			vector.getJsInitLines(featureContext)
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
	})
	context("with 2 first components out of 3 variable vector",()=>{
		const options=new TestOptions({foo:{
			x:{input:'slider'}, y:{input:'slider'}
		}})
		const vector=new GlslVector('foo',options.fix().foo.entries)
		it("returns vec2 declaration",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().get(),[
				"uniform vec2 foo;"
			])
		})
		it("returns vec3 made of vec2 and constant as value",()=>{
			assert.equal(vector.getGlslValue(),
				"vec3(foo,3.0)"
			)
		})
		it("returns original vec2 .x as components",()=>{
			assert.equal(vector.getGlslComponentsValue('x'),
				"foo.x"
			)
		})
		it("returns original vec2 as components",()=>{
			assert.equal(vector.getGlslComponentsValue('xy'),
				"foo"
			)
		})
		it("returns original vec2 with swizzling as components",()=>{
			assert.equal(vector.getGlslComponentsValue('yx'),
				"foo.yx"
			)
		})
		it("returns original vec2 component and constant as components",()=>{
			assert.equal(vector.getGlslComponentsValue('yz'),
				"vec2(foo.y,3.0)"
			)
		})
		it("returns interface with 1 location and 2 simple listeners",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
				"var fooLoc=gl.getUniformLocation(program,'foo')",
				"function updateFoo() {",
				"	gl.uniform2f(fooLoc,",
				"		parseFloat(document.getElementById('foo.x').value),",
				"		parseFloat(document.getElementById('foo.y').value)",
				"	)",
				"}",
				"updateFoo()",
				"document.getElementById('foo.x').addEventListener('change',updateFoo)",
				"document.getElementById('foo.y').addEventListener('change',updateFoo)"
			])
		})
		it("returns interface with one location and query listener with frame sheduling",()=>{
			const featureContext=new FeatureContext(false)
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
				"var fooLoc=gl.getUniformLocation(program,'foo')",
				"function updateFoo() {",
				"	gl.uniform2f(fooLoc,",
				"		parseFloat(document.getElementById('foo.x').value),",
				"		parseFloat(document.getElementById('foo.y').value)",
				"	)",
				"}",
				"updateFoo()",
				";[].forEach.call(document.querySelectorAll('[id^=\"foo.\"]'),function(el){",
				"	el.addEventListener('change',function(){",
				"		updateFoo()",
				"		scheduleFrame()",
				"	})",
				"})"
			])
		})
	})
	context("with 2 first components out of 3 variable vector with dot in name",()=>{
		const options=new TestOptions({foo:{
			x:{input:'slider'}, y:{input:'slider'}
		}})
		const vector=new GlslVector('foo.bar',options.fix().foo.entries)
		it("returns interface with 1 location and 2 simple listeners",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
				"var fooBarLoc=gl.getUniformLocation(program,'fooBar')",
				"function updateFooBar() {",
				"	gl.uniform2f(fooBarLoc,",
				"		parseFloat(document.getElementById('foo.bar.x').value),",
				"		parseFloat(document.getElementById('foo.bar.y').value)",
				"	)",
				"}",
				"updateFooBar()",
				"document.getElementById('foo.bar.x').addEventListener('change',updateFooBar)",
				"document.getElementById('foo.bar.y').addEventListener('change',updateFooBar)"
			])
		})
	})
	context("with first and third components out of 3 variable vector",()=>{
		const options=new TestOptions({foo:{
			x:{input:'slider'}, z:{input:'slider'}
		}})
		const vector=new GlslVector('foo',options.fix().foo.entries)
		it("returns 2 float declarations",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().get(),[
				"uniform float fooX;",
				"uniform float fooZ;"
			])
		})
		it("returns vec3 made of floats and constant as value",()=>{
			assert.equal(vector.getGlslValue(),
				"vec3(fooX,2.0,fooZ)"
			)
		})
		it("returns interface with 2 locations and 2 simple listeners",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
				"var fooXLoc=gl.getUniformLocation(program,'fooX')",
				"var fooZLoc=gl.getUniformLocation(program,'fooZ')",
				"function updateFoo() {",
				"	gl.uniform1f(fooXLoc,parseFloat(document.getElementById('foo.x').value))",
				"	gl.uniform1f(fooZLoc,parseFloat(document.getElementById('foo.z').value))",
				"}",
				"updateFoo()",
				"document.getElementById('foo.x').addEventListener('change',updateFoo)",
				"document.getElementById('foo.z').addEventListener('change',updateFoo)"
			])
		})
	})
	context("with all-variable 3 component vector",()=>{
		const options=new TestOptions({foo:{
			x:{input:'slider'}, y:{input:'slider'}, z:{input:'slider'}
		}})
		const vector=new GlslVector('foo',options.fix().foo.entries)
		it("returns vec3 declaration",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().get(),[
				"uniform vec3 foo;"
			])
		})
		it("returns value equal to declaration",()=>{
			assert.equal(vector.getGlslValue(),
				"foo"
			)
		})
	})
	context("with 2 first components (slider, mousemove) out of 3 variable vector",()=>{
		const options=new TestOptions({foo:{
			x:{input:'slider'}, y:{input:'mousemovex'}
		}})
		const vector=new GlslVector('foo',options.fix().foo.entries)
		it("returns interface with 1 location, 1 state var and 1 simple listener and mousemove listener",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
				"var fooLoc=gl.getUniformLocation(program,'foo')",
				"var fooY=2",
				"function updateFoo() {",
				"	gl.uniform2f(fooLoc,",
				"		parseFloat(document.getElementById('foo.x').value),",
				"		fooY",
				"	)",
				"}",
				"updateFoo()",
				"document.getElementById('foo.x').addEventListener('change',updateFoo)"
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect()",
				"	var minFooY=-4",
				"	var maxFooY=+4",
				"	fooY=minFooY+(maxFooY-minFooY)*(ev.clientX-rect.left)/(rect.width-1)",
				"	updateFoo()",
				"})"
			])
		})
	})
	context("with 1 mousemove component out of 3 variable vector",()=>{
		const options=new TestOptions({foo:{
			y:{value:2.5,input:'mousemovey'}
		}})
		const vector=new GlslVector('bar',options.fix().foo.entries)
		it("returns interface without update fn",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
				"var barYLoc=gl.getUniformLocation(program,'barY')",
				"gl.uniform1f(barYLoc,2.5)"
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect()",
				"	var minBarY=-4",
				"	var maxBarY=+4",
				"	var barY=minBarY+(maxBarY-minBarY)*(rect.bottom-1-ev.clientY)/(rect.height-1)",
				"	gl.uniform1f(barYLoc,barY)",
				"})"
			])
		})
	})
	context("with 2 first mousemove components out of 3 variable vector",()=>{
		const options=new TestOptions({foo:{
			x:{value:1.5,input:'mousemovex'}, y:{value:2.5,input:'mousemovey'}
		}})
		const vector=new GlslVector('bar',options.fix().foo.entries)
		it('returns interface without update fn',()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
				"var barLoc=gl.getUniformLocation(program,'bar')",
				"gl.uniform2f(barLoc,1.5,2.5)"
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect()",
				"	var minBarX=-4",
				"	var maxBarX=+4",
				"	var barX=minBarX+(maxBarX-minBarX)*(ev.clientX-rect.left)/(rect.width-1)",
				"	var minBarY=-4",
				"	var maxBarY=+4",
				"	var barY=minBarY+(maxBarY-minBarY)*(rect.bottom-1-ev.clientY)/(rect.height-1)",
				"	gl.uniform2f(barLoc,barX,barY)",
				"})"
			])
		})
	})
	context("with 2 non-first mousemove components out of 3 variable vector",()=>{
		const options=new TestOptions({foo:{
			x:1.5, y:{value:2.5,input:'mousemovey'}, z:{input:'mousemovex'}
		}})
		const vector=new GlslVector('bar',options.fix().foo.entries)
		it("returns interface without update fn",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
				"var barYLoc=gl.getUniformLocation(program,'barY')",
				"var barZLoc=gl.getUniformLocation(program,'barZ')",
				"gl.uniform1f(barYLoc,2.5)",
				"gl.uniform1f(barZLoc,3.0)"
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect()",
				"	var minBarY=-4",
				"	var maxBarY=+4",
				"	var barY=minBarY+(maxBarY-minBarY)*(rect.bottom-1-ev.clientY)/(rect.height-1)",
				"	var minBarZ=-4",
				"	var maxBarZ=+4",
				"	var barZ=minBarZ+(maxBarZ-minBarZ)*(ev.clientX-rect.left)/(rect.width-1)",
				"	gl.uniform1f(barYLoc,barY)",
				"	gl.uniform1f(barZLoc,barZ)",
				"})"
			])
		})
	})
	context("with nonnegative limits",()=>{
		class NonnegativeTestOptions extends Options {
			get entriesDescription() {
				return [
					['LiveColor','color',[0.2,0.3,0.4,0.5]],
				]
			}
		}
		const options=new NonnegativeTestOptions
		const vector=new GlslVector('color',options.fix().color.entries)
		it("returns unsigned value",()=>{
			assert.equal(vector.getGlslValue(),
				"vec4(0.2,0.3,0.4,0.5)"
			)
		})
	})
	context("with all-variable 3 component vector and name with dot",()=>{
		const options=new TestOptions({foo:{
			x:{input:'slider'}, y:{input:'slider'}, z:{input:'slider'}
		}})
		const vector=new GlslVector('my.foo',options.fix().foo.entries)
		it("returns vec3 declaration",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().get(),[
				"uniform vec3 myFoo;"
			])
		})
		it("returns value equal to declaration",()=>{
			assert.equal(vector.getGlslValue(),
				"myFoo"
			)
		})
		it("returns .x component of declared vec3",()=>{
			assert.equal(vector.getGlslComponentsValue('x'),
				"myFoo.x"
			)
		})
	})
	context("with variable 1 component vector",()=>{
		class OneComponentTestOptions extends Options {
			get entriesDescription() {
				return [
					['Group','rotate',[
						['LiveFloat','z',[-4.0,+4.0,-4.0,+4.0],+3.0],
					]],
				]
			}
		}
		const options=new OneComponentTestOptions({rotate:{
			z:{input:'slider'}
		}})
		const vector=new GlslVector('rotate',options.fix().rotate.entries)
		it("returns float declaration",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().get(),[
				"uniform float rotateZ;"
			])
		})
		it("returns value equal to declaration",()=>{
			assert.equal(vector.getGlslValue(),
				"rotateZ"
			)
		})
		it("returns float map declaration",()=>{
			assert.deepEqual(vector.getGlslMapDeclarationLines('c',v=>"cos("+v+")").get(),[
				"float cz=cos(rotateZ);"
			])
		})
		it("returns float map",()=>{
			assert.equal(vector.getGlslMapComponentValue('c','z'),
				"cz"
			)
		})
	})
	context("with constant positive speed",()=>{
		const options=new TestOptions({foo:{
			x:{value:0.5, speed:+0.123}, y:0.4, z:0.3
		}})
		const vector=new GlslVector('foo',options.fix().foo.entries)
		it("returns float declaration",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().get(),[
				"uniform float fooX;"
			])
		})
		it("returns vec3 made of float and constants as value",()=>{
			assert.equal(vector.getGlslValue(),
				"vec3(fooX,0.4,0.3)"
			)
		})
		it("returns vec2 of float and constant as xy components",()=>{
			assert.equal(vector.getGlslComponentsValue('xy'),
				"vec2(fooX,0.4)"
			)
		})
		it("returns float as x component",()=>{
			assert.equal(vector.getGlslComponentsValue('x'),
				"fooX"
			)
		})
		it("requests start time",()=>{
			const testFeatureContext={}
			vector.requestFeatureContext(testFeatureContext)
			assert.deepEqual(testFeatureContext,{
				hasStartTime: true,
			})
		})
		it("has no state vars",()=>{
			const featureContext=new FeatureContext(options.fix().debug)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).get(),[
				"var fooXLoc=gl.getUniformLocation(program,'fooX')"
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
		it("has loop with constant increment",()=>{
			assert.deepEqual(vector.getJsLoopLines().get(),[
				"var fooX=Math.min(0.5+0.123*(time-startTime)/1000,4)",
				"gl.uniform1f(fooXLoc,fooX)"
			])
		})
	})
	context("with no value input, constant speed and wrap mode",()=>{
		const options=new TestOptions({foo:{
			x:{speed:-3.456}
		}})
		const vector=new GlslVector('foo',options.fix().foo.entries,4.0)
		it("requests start time",()=>{
			const testFeatureContext={}
			vector.requestFeatureContext(testFeatureContext)
			assert.deepEqual(testFeatureContext,{
				hasStartTime: true,
			})
		})
		it("has loop with no limit fn",()=>{
			assert.deepEqual(vector.getJsLoopLines().get(),[
				"var fooX=1-3.456*(time-startTime)/1000",
				"gl.uniform1f(fooXLoc,fooX)"
			])
		})
	})
	context("with no value input, controlled speed and wrap mode",()=>{
		const options=new TestOptions({foo:{
			x:{speed:{input:'mousemovex'}}
		}})
		const vector=new GlslVector('foo',options.fix().foo.entries,4.0)
		it("requests prev time",()=>{
			const testFeatureContext={}
			vector.requestFeatureContext(testFeatureContext)
			assert.deepEqual(testFeatureContext,{
				hasPrevTime: true,
				hasInputs: true,
			})
		})
		it("has loop with no limit fn",()=>{
			assert.deepEqual(vector.getJsLoopLines().get(),[
				"fooX+=fooXSpeed*(time-prevTime)/1000",
				"gl.uniform1f(fooXLoc,fooX)"
			])
		})
	})
	context("with slider value input, controlled speed and wrap mode",()=>{
		const options=new TestOptions({foo:{
			x:{input:'slider', speed:{input:'mousemovex'}}
		}})
		const vector=new GlslVector('foo',options.fix().foo.entries,4.0)
		it("requests prev time and wrap fn",()=>{
			const testFeatureContext={}
			vector.requestFeatureContext(testFeatureContext)
			assert.deepEqual(testFeatureContext,{
				hasPrevTime: true,
				hasWrapFn: true,
				hasSliders: true,
				hasInputs: true,
			})
		})
		it("has loop with wrap()",()=>{
			assert.deepEqual(vector.getJsLoopLines().get(),[
				"var fooXInput=document.getElementById('foo.x')",
				"var fooX=wrap(parseFloat(fooXInput.value)+fooXSpeed*(time-prevTime)/1000,4)",
				"fooXInput.value=fooX",
				"gl.uniform1f(fooXLoc,fooX)"
			])
		})
	})
})
