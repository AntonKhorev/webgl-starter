var assert=require('assert');

var Uniform=require('../src/uniform.js');
var listeners=require('../src/listeners.js');

describe('Uniform',function(){
	context('with constant vector',function(){
		var uniform=new Uniform('foo','bar','xyz',{
			'bar.x':1.0, 'bar.x.input':'constant',
			'bar.y':2.0, 'bar.y.input':'constant',
			'bar.z':3.0, 'bar.z.input':'constant'
		});
		it('returns empty declaration',function(){
			assert.deepEqual(uniform.getGlslDeclarationLines().data,[
			]);
		});
		it('returns constant vec3 value',function(){
			assert.equal(uniform.getGlslValue(),
				"vec3(+1.000,+2.000,+3.000)"
			);
		});
		it('returns empty js interface',function(){
			assert.deepEqual(uniform.getJsInterfaceLines([false,false]).data,[
			]);
		});
	});
	context('with equal-component constant vector',function(){
		var uniform=new Uniform('foo','bar','xyz',{
			'bar.x':2.0, 'bar.x.input':'constant',
			'bar.y':2.0, 'bar.y.input':'constant',
			'bar.z':2.0, 'bar.z.input':'constant'
		});
		it('returns empty declaration',function(){
			assert.deepEqual(uniform.getGlslDeclarationLines().data,[
			]);
		});
		it('returns constant vec3 with one component as value',function(){
			assert.equal(uniform.getGlslValue(),
				"vec3(+2.000)"
			);
		});
		it('returns empty js interface',function(){
			assert.deepEqual(uniform.getJsInterfaceLines([false,false]).data,[
			]);
		});
	});
	context('with 1 first component out of 3 variable vector',function(){
		var uniform=new Uniform('foo','bar','xyz',{
			'bar.x':1.0, 'bar.x.input':'slider',
			'bar.y':2.0, 'bar.y.input':'constant',
			'bar.z':3.0, 'bar.z.input':'constant'
		});
		it('returns float declaration',function(){
			assert.deepEqual(uniform.getGlslDeclarationLines().data,[
				"uniform float fooX;"
			]);
		});
		it('returns vec3 made of float and constants as value',function(){
			assert.equal(uniform.getGlslValue(),
				"vec3(fooX,+2.000,+3.000)"
			);
		});
		it('returns interface with 1 location and 1 simple listener',function(){
			assert.deepEqual(uniform.getJsInterfaceLines([false,false]).data,[
				"var fooXLoc=gl.getUniformLocation(program,'fooX');",
				"function updateFoo() {",
				"	gl.uniform1f(fooXLoc,parseFloat(document.getElementById('bar.x').value));",
				"}",
				"updateFoo();",
				"document.getElementById('bar.x').addEventListener('change',updateFoo);"
			]);
		});
	});
	context('with 2 first components out of 3 variable vector',function(){
		var uniform=new Uniform('foo','bar','xyz',{
			'bar.x':1.0, 'bar.x.input':'slider',
			'bar.y':2.0, 'bar.y.input':'slider',
			'bar.z':3.0, 'bar.z.input':'constant'
		});
		it('returns vec2 declaration',function(){
			assert.deepEqual(uniform.getGlslDeclarationLines().data,[
				"uniform vec2 foo;"
			]);
		});
		it('returns vec3 made of vec2 and constant as value',function(){
			assert.equal(uniform.getGlslValue(),
				"vec3(foo,+3.000)"
			);
		});
		it('returns interface with 1 location and 2 simple listeners',function(){
			assert.deepEqual(uniform.getJsInterfaceLines([false,false]).data,[
				"var fooLoc=gl.getUniformLocation(program,'foo');",
				"function updateFoo() {",
				"	gl.uniform2f(fooLoc,",
				"		parseFloat(document.getElementById('bar.x').value),",
				"		parseFloat(document.getElementById('bar.y').value)",
				"	);",
				"}",
				"updateFoo();",
				"document.getElementById('bar.x').addEventListener('change',updateFoo);",
				"document.getElementById('bar.y').addEventListener('change',updateFoo);"
			]);
		});
		it('returns interface with one location and query listener with frame sheduling',function(){
			assert.deepEqual(uniform.getJsInterfaceLines([true,false]).data,[
				"var fooLoc=gl.getUniformLocation(program,'foo');",
				"function updateFoo() {",
				"	gl.uniform2f(fooLoc,",
				"		parseFloat(document.getElementById('bar.x').value),",
				"		parseFloat(document.getElementById('bar.y').value)",
				"	);",
				"}",
				"updateFoo();",
				"[].forEach.call(document.querySelectorAll('[id^=\"bar.\"]'),function(el){",
				"	el.addEventListener('change',function(){",
				"		updateFoo();",
				"		scheduleFrame();",
				"	});",
				"});"
			]);
		});
	});
	context('with first and third components out of 3 variable vector',function(){
		var uniform=new Uniform('foo','bar','xyz',{
			'bar.x':1.0, 'bar.x.input':'slider',
			'bar.y':2.0, 'bar.y.input':'constant',
			'bar.z':3.0, 'bar.z.input':'slider'
		});
		it('returns 2 float declarations',function(){
			assert.deepEqual(uniform.getGlslDeclarationLines().data,[
				"uniform float fooX;",
				"uniform float fooZ;"
			]);
		});
		it('returns vec3 made of floats and constant as value',function(){
			assert.equal(uniform.getGlslValue(),
				"vec3(fooX,+2.000,fooZ)"
			);
		});
		it('returns interface with 2 locations and 2 simple listeners',function(){
			assert.deepEqual(uniform.getJsInterfaceLines([false,false]).data,[
				"var fooXLoc=gl.getUniformLocation(program,'fooX');",
				"var fooZLoc=gl.getUniformLocation(program,'fooZ');",
				"function updateFoo() {",
				"	gl.uniform1f(fooXLoc,parseFloat(document.getElementById('bar.x').value));",
				"	gl.uniform1f(fooZLoc,parseFloat(document.getElementById('bar.z').value));",
				"}",
				"updateFoo();",
				"document.getElementById('bar.x').addEventListener('change',updateFoo);",
				"document.getElementById('bar.z').addEventListener('change',updateFoo);"
			]);
		});
	});
	context('with all-variable 3 component vector',function(){
		var uniform=new Uniform('foo','bar','xyz',{
			'bar.x':1.0, 'bar.x.input':'slider',
			'bar.y':2.0, 'bar.y.input':'slider',
			'bar.z':3.0, 'bar.z.input':'slider'
		});
		it('returns vec3 declaration',function(){
			assert.deepEqual(uniform.getGlslDeclarationLines().data,[
				"uniform vec3 foo;"
			]);
		});
		it('returns value equal to declaration',function(){
			assert.equal(uniform.getGlslValue(),
				"foo"
			);
		});
	});
	context('with 2 first components (slider, mousemove) out of 3 variable vector',function(){
		var uniform=new Uniform('foo','bar','xyz',{
			'bar.x':1.0, 'bar.x.input':'slider',
			'bar.y':2.0, 'bar.y.input':'mousemovex',
			'bar.z':3.0, 'bar.z.input':'constant'
		});
		it('returns interface with 1 location, 1 state var and 1 simple listener and mousemove listener',function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(uniform.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"var fooLoc=gl.getUniformLocation(program,'foo');",
				"var fooY=+2.000;",
				"function updateFoo() {",
				"	gl.uniform2f(fooLoc,",
				"		parseFloat(document.getElementById('bar.x').value),",
				"		fooY",
				"	);",
				"}",
				"updateFoo();",
				"document.getElementById('bar.x').addEventListener('change',updateFoo);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	fooY=4*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",
				/*
				"	var minFooY=-4;",
				"	var maxFooY=+4;",
				"	fooY=(minFooY+(maxFooY-minFooY)*(ev.clientX-rect.left)/(rect.width-1));",
				*/
				"	updateFoo();",
				"});"
			]);
		});
	});
});
