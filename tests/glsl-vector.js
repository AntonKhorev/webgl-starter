'use strict';

const assert=require('assert');
const Options=require('../src/options.js');
const FeatureContext=require('../src/feature-context.js');
const GlslVector=require('../src/glsl-vector.js');

describe("GlslVector",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['Group','foo',[
					['LiveFloat','x',[-4.0,+4.0,-4.0,+4.0],+1.0],
					['LiveFloat','y',[-4.0,+4.0,-4.0,+4.0],+2.0],
					['LiveFloat','z',[-4.0,+4.0,-4.0,+4.0],+3.0],
				]],
			];
		}
	}
	context("with constant vector",()=>{
		const options=new TestOptions;
		const vector=new GlslVector('foo',options.fix().foo);
		it("returns empty declaration",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().data,[
			]);
		});
		it("returns constant vec3 value",()=>{
			assert.equal(vector.getGlslValue(),
				"vec3(+1.000,+2.000,+3.000)"
			);
		});
		it("returns constant vec2 components",()=>{
			assert.equal(vector.getGlslComponentsValue('yz'),
				"vec2(+2.000,+3.000)"
			);
		});
		it("returns vec3 map declaration",()=>{
			assert.deepEqual(vector.getGlslMapDeclarationLines('ololo',v=>"lol("+v+")").data,[
				"vec3 ololo=lol(vec3(+1.000,+2.000,+3.000));"
			]);
		});
		it("returns vec3 map component",()=>{
			assert.equal(vector.getGlslMapComponentValue('ololo','x'),
				"ololo.x"
			);
		});
		it("returns empty js interface",()=>{
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
			]);
		});
	});
	context('with equal-component constant vector',function(){
		const options=new TestOptions({foo:{
			x:2.0, y:2.0, z:2.0
		}});
		const vector=new GlslVector('foo',options.fix().foo);
		it('returns empty declaration',function(){
			assert.deepEqual(vector.getGlslDeclarationLines().data,[
			]);
		});
		it('returns constant vec3 with one component as value',function(){
			assert.equal(vector.getGlslValue(),
				"vec3(+2.000)"
			);
		});
		it('returns constant vec2 with one component',function(){
			assert.equal(vector.getGlslComponentsValue('yz'),
				"vec2(+2.000)"
			);
		});
		it('returns empty js interface',function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
			]);
		});
	});
	context('with 1 first component out of 3 variable vector',function(){
		const options=new TestOptions({foo:{
			x:{input:'slider'}
		}});
		const vector=new GlslVector('foo',options.fix().foo);
		it('returns float declaration',function(){
			assert.deepEqual(vector.getGlslDeclarationLines().data,[
				"uniform float fooX;"
			]);
		});
		it('returns vec3 made of float and constants as value',function(){
			assert.equal(vector.getGlslValue(),
				"vec3(fooX,+2.000,+3.000)"
			);
		});
		it('returns vec2 of float and constant as xy components',function(){
			assert.equal(vector.getGlslComponentsValue('xy'),
				"vec2(fooX,+2.000)"
			);
		});
		it('returns float as x component',function(){
			assert.equal(vector.getGlslComponentsValue('x'),
				"fooX"
			);
		});
		it('returns interface with 1 location and 1 simple listener',function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var fooXLoc=gl.getUniformLocation(program,'fooX');",
				"function updateFoo() {",
				"	gl.uniform1f(fooXLoc,parseFloat(document.getElementById('foo.x').value));",
				"}",
				"updateFoo();",
				"document.getElementById('foo.x').addEventListener('change',updateFoo);"
			]);
		});
		it("doesn't write empty mousemove listener code",function(){
			const featureContext=new FeatureContext(false);
			vector.getJsInitLines(featureContext);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context('with 2 first components out of 3 variable vector',function(){
		const options=new TestOptions({foo:{
			x:{input:'slider'}, y:{input:'slider'}
		}});
		const vector=new GlslVector('foo',options.fix().foo);
		it('returns vec2 declaration',function(){
			assert.deepEqual(vector.getGlslDeclarationLines().data,[
				"uniform vec2 foo;"
			]);
		});
		it('returns vec3 made of vec2 and constant as value',function(){
			assert.equal(vector.getGlslValue(),
				"vec3(foo,+3.000)"
			);
		});
		it('returns original vec2 .x as components',function(){
			assert.equal(vector.getGlslComponentsValue('x'),
				"foo.x"
			);
		});
		it('returns original vec2 as components',function(){
			assert.equal(vector.getGlslComponentsValue('xy'),
				"foo"
			);
		});
		it('returns original vec2 with swizzling as components',function(){
			assert.equal(vector.getGlslComponentsValue('yx'),
				"foo.yx"
			);
		});
		it('returns original vec2 component and constant as components',function(){
			assert.equal(vector.getGlslComponentsValue('yz'),
				"vec2(foo.y,+3.000)"
			);
		});
		it('returns interface with 1 location and 2 simple listeners',function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var fooLoc=gl.getUniformLocation(program,'foo');",
				"function updateFoo() {",
				"	gl.uniform2f(fooLoc,",
				"		parseFloat(document.getElementById('foo.x').value),",
				"		parseFloat(document.getElementById('foo.y').value)",
				"	);",
				"}",
				"updateFoo();",
				"document.getElementById('foo.x').addEventListener('change',updateFoo);",
				"document.getElementById('foo.y').addEventListener('change',updateFoo);"
			]);
		});
		it('returns interface with one location and query listener with frame sheduling',function(){
			const featureContext=new FeatureContext(false);
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var fooLoc=gl.getUniformLocation(program,'foo');",
				"function updateFoo() {",
				"	gl.uniform2f(fooLoc,",
				"		parseFloat(document.getElementById('foo.x').value),",
				"		parseFloat(document.getElementById('foo.y').value)",
				"	);",
				"}",
				"updateFoo();",
				"[].forEach.call(document.querySelectorAll('[id^=\"foo.\"]'),function(el){",
				"	el.addEventListener('change',function(){",
				"		updateFoo();",
				"		scheduleFrame();",
				"	});",
				"});"
			]);
		});
	});
	context('with 2 first components out of 3 variable vector with dot in name',function(){
		const options=new TestOptions({foo:{
			x:{input:'slider'}, y:{input:'slider'}
		}});
		const vector=new GlslVector('foo.bar',options.fix().foo);
		it('returns interface with 1 location and 2 simple listeners',function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var fooBarLoc=gl.getUniformLocation(program,'fooBar');",
				"function updateFooBar() {",
				"	gl.uniform2f(fooBarLoc,",
				"		parseFloat(document.getElementById('foo.bar.x').value),",
				"		parseFloat(document.getElementById('foo.bar.y').value)",
				"	);",
				"}",
				"updateFooBar();",
				"document.getElementById('foo.bar.x').addEventListener('change',updateFooBar);",
				"document.getElementById('foo.bar.y').addEventListener('change',updateFooBar);"
			]);
		});
	});
	context('with first and third components out of 3 variable vector',function(){
		const options=new TestOptions({foo:{
			x:{input:'slider'}, z:{input:'slider'}
		}});
		const vector=new GlslVector('foo',options.fix().foo);
		it('returns 2 float declarations',function(){
			assert.deepEqual(vector.getGlslDeclarationLines().data,[
				"uniform float fooX;",
				"uniform float fooZ;"
			]);
		});
		it('returns vec3 made of floats and constant as value',function(){
			assert.equal(vector.getGlslValue(),
				"vec3(fooX,+2.000,fooZ)"
			);
		});
		it('returns interface with 2 locations and 2 simple listeners',function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var fooXLoc=gl.getUniformLocation(program,'fooX');",
				"var fooZLoc=gl.getUniformLocation(program,'fooZ');",
				"function updateFoo() {",
				"	gl.uniform1f(fooXLoc,parseFloat(document.getElementById('foo.x').value));",
				"	gl.uniform1f(fooZLoc,parseFloat(document.getElementById('foo.z').value));",
				"}",
				"updateFoo();",
				"document.getElementById('foo.x').addEventListener('change',updateFoo);",
				"document.getElementById('foo.z').addEventListener('change',updateFoo);"
			]);
		});
	});
	context('with all-variable 3 component vector',function(){
		const options=new TestOptions({foo:{
			x:{input:'slider'}, y:{input:'slider'}, z:{input:'slider'}
		}});
		const vector=new GlslVector('foo',options.fix().foo);
		it('returns vec3 declaration',function(){
			assert.deepEqual(vector.getGlslDeclarationLines().data,[
				"uniform vec3 foo;"
			]);
		});
		it('returns value equal to declaration',function(){
			assert.equal(vector.getGlslValue(),
				"foo"
			);
		});
	});
	context('with 2 first components (slider, mousemove) out of 3 variable vector',function(){
		const options=new TestOptions({foo:{
			x:{input:'slider'}, y:{input:'mousemovex'}
		}});
		const vector=new GlslVector('foo',options.fix().foo);
		it('returns interface with 1 location, 1 state var and 1 simple listener and mousemove listener',function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var fooLoc=gl.getUniformLocation(program,'foo');",
				"var fooY=+2.000;",
				"function updateFoo() {",
				"	gl.uniform2f(fooLoc,",
				"		parseFloat(document.getElementById('foo.x').value),",
				"		fooY",
				"	);",
				"}",
				"updateFoo();",
				"document.getElementById('foo.x').addEventListener('change',updateFoo);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	var minFooY=-4.000;",
				"	var maxFooY=+4.000;",
				"	fooY=minFooY+(maxFooY-minFooY)*(ev.clientX-rect.left)/(rect.width-1);",
				"	updateFoo();",
				"});"
			]);
		});
	});
	context('with 1 mousemove component out of 3 variable vector',function(){
		const options=new TestOptions({foo:{
			y:{value:2.5,input:'mousemovey'}
		}});
		const vector=new GlslVector('bar',options.fix().foo);
		it('returns interface without update fn',function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var barYLoc=gl.getUniformLocation(program,'barY');",
				"gl.uniform1f(barYLoc,+2.500);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	var minBarY=-4.000;",
				"	var maxBarY=+4.000;",
				"	var barY=minBarY+(maxBarY-minBarY)*(rect.bottom-1-ev.clientY)/(rect.height-1);",
				"	gl.uniform1f(barYLoc,barY);",
				"});"
			]);
		});
	});
	context('with 2 first mousemove components out of 3 variable vector',function(){
		const options=new TestOptions({foo:{
			x:{value:1.5,input:'mousemovex'}, y:{value:2.5,input:'mousemovey'}
		}});
		const vector=new GlslVector('bar',options.fix().foo);
		it('returns interface without update fn',function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var barLoc=gl.getUniformLocation(program,'bar');",
				"gl.uniform2f(barLoc,+1.500,+2.500);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	var minBarX=-4.000;",
				"	var maxBarX=+4.000;",
				"	var barX=minBarX+(maxBarX-minBarX)*(ev.clientX-rect.left)/(rect.width-1);",
				"	var minBarY=-4.000;",
				"	var maxBarY=+4.000;",
				"	var barY=minBarY+(maxBarY-minBarY)*(rect.bottom-1-ev.clientY)/(rect.height-1);",
				"	gl.uniform2f(barLoc,barX,barY);",
				"});"
			]);
		});
	});
	context('with 2 non-first mousemove components out of 3 variable vector',function(){
		const options=new TestOptions({foo:{
			x:1.5, y:{value:2.5,input:'mousemovey'}, z:{input:'mousemovex'}
		}});
		const vector=new GlslVector('bar',options.fix().foo);
		it('returns interface without update fn',function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var barYLoc=gl.getUniformLocation(program,'barY');",
				"var barZLoc=gl.getUniformLocation(program,'barZ');",
				"gl.uniform1f(barYLoc,+2.500);",
				"gl.uniform1f(barZLoc,+3.000);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	var minBarY=-4.000;",
				"	var maxBarY=+4.000;",
				"	var barY=minBarY+(maxBarY-minBarY)*(rect.bottom-1-ev.clientY)/(rect.height-1);",
				"	var minBarZ=-4.000;",
				"	var maxBarZ=+4.000;",
				"	var barZ=minBarZ+(maxBarZ-minBarZ)*(ev.clientX-rect.left)/(rect.width-1);",
				"	gl.uniform1f(barYLoc,barY);",
				"	gl.uniform1f(barZLoc,barZ);",
				"});"
			]);
		});
	});
	context('with nonnegative limits',function(){
		class NonnegativeTestOptions extends Options {
			get entriesDescription() {
				return [
					['LiveColor','color',[0.2,0.3,0.4,0.5]],
				];
			}
		}
		const options=new NonnegativeTestOptions;
		const vector=new GlslVector('color',options.fix().color);
		it('returns unsigned value',function(){
			assert.equal(vector.getGlslValue(),
				"vec4(0.200,0.300,0.400,0.500)"
			);
		});
	});
	context('with all-variable 3 component vector and name with dot',function(){
		const options=new TestOptions({foo:{
			x:{input:'slider'}, y:{input:'slider'}, z:{input:'slider'}
		}});
		const vector=new GlslVector('my.foo',options.fix().foo);
		it('returns vec3 declaration',function(){
			assert.deepEqual(vector.getGlslDeclarationLines().data,[
				"uniform vec3 myFoo;"
			]);
		});
		it('returns value equal to declaration',function(){
			assert.equal(vector.getGlslValue(),
				"myFoo"
			);
		});
		it('returns .x component of declared vec3',function(){
			assert.equal(vector.getGlslComponentsValue('x'),
				"myFoo.x"
			);
		});
	});
	context("with variable 1 component vector",()=>{
		class OneComponentTestOptions extends Options {
			get entriesDescription() {
				return [
					['Group','rotate',[
						['LiveFloat','z',[-4.0,+4.0,-4.0,+4.0],+3.0],
					]],
				];
			}
		}
		const options=new OneComponentTestOptions({rotate:{
			z:{input:'slider'}
		}});
		const vector=new GlslVector('rotate',options.fix().rotate);
		it("returns float declaration",()=>{
			assert.deepEqual(vector.getGlslDeclarationLines().data,[
				"uniform float rotateZ;"
			]);
		});
		it("returns value equal to declaration",()=>{
			assert.equal(vector.getGlslValue(),
				"rotateZ"
			);
		});
		it("returns float map declaration",()=>{
			assert.deepEqual(vector.getGlslMapDeclarationLines('c',v=>"cos("+v+")").data,[
				"float cz=cos(rotateZ);"
			]);
		});
		it("returns float map",()=>{
			assert.equal(vector.getGlslMapComponentValue('c','z'),
				"cz"
			);
		});
	});
});
