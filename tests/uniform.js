var assert=require('assert');

var Uniform=require('../src/uniform.js');
var listeners=require('../src/listeners.js');

describe('Uniform',function(){
	context('with constant vector',function(){
		var uniform=new Uniform('foo','bar','xyz',{
			'bar.x':1.0, 'bar.x.input':'constant', 'bar.x.min':-4.0, 'bar.x.max':+4.0,
			'bar.y':2.0, 'bar.y.input':'constant', 'bar.y.min':-4.0, 'bar.y.max':+4.0,
			'bar.z':3.0, 'bar.z.input':'constant', 'bar.z.min':-4.0, 'bar.z.max':+4.0
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
			'bar.x':2.0, 'bar.x.input':'constant', 'bar.x.min':-4.0, 'bar.x.max':+4.0,
			'bar.y':2.0, 'bar.y.input':'constant', 'bar.y.min':-4.0, 'bar.y.max':+4.0,
			'bar.z':2.0, 'bar.z.input':'constant', 'bar.z.min':-4.0, 'bar.z.max':+4.0
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
			'bar.x':1.0, 'bar.x.input':'slider',   'bar.x.min':-4.0, 'bar.x.max':+4.0,
			'bar.y':2.0, 'bar.y.input':'constant', 'bar.y.min':-4.0, 'bar.y.max':+4.0,
			'bar.z':3.0, 'bar.z.input':'constant', 'bar.z.min':-4.0, 'bar.z.max':+4.0
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
		it("doesn't write empty mousemove listener code",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			uniform.getJsInterfaceLines([true,false],canvasMousemoveListener);
			assert.deepEqual(canvasMousemoveListener.write(true,false).data,[
			]);
		});
	});
	context('with 2 first components out of 3 variable vector',function(){
		var uniform=new Uniform('foo','bar','xyz',{
			'bar.x':1.0, 'bar.x.input':'slider',   'bar.x.min':-4.0, 'bar.x.max':+4.0,
			'bar.y':2.0, 'bar.y.input':'slider',   'bar.y.min':-4.0, 'bar.y.max':+4.0,
			'bar.z':3.0, 'bar.z.input':'constant', 'bar.z.min':-4.0, 'bar.z.max':+4.0
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
			'bar.x':1.0, 'bar.x.input':'slider',   'bar.x.min':-4.0, 'bar.x.max':+4.0,
			'bar.y':2.0, 'bar.y.input':'constant', 'bar.y.min':-4.0, 'bar.y.max':+4.0,
			'bar.z':3.0, 'bar.z.input':'slider',   'bar.z.min':-4.0, 'bar.z.max':+4.0
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
			'bar.x':1.0, 'bar.x.input':'slider', 'bar.x.min':-4.0, 'bar.x.max':+4.0,
			'bar.y':2.0, 'bar.y.input':'slider', 'bar.y.min':-4.0, 'bar.y.max':+4.0,
			'bar.z':3.0, 'bar.z.input':'slider', 'bar.z.min':-4.0, 'bar.z.max':+4.0
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
			'bar.x':1.0, 'bar.x.input':'slider',     'bar.x.min':-4.0, 'bar.x.max':+4.0,
			'bar.y':2.0, 'bar.y.input':'mousemovex', 'bar.y.min':-4.0, 'bar.y.max':+4.0,
			'bar.z':3.0, 'bar.z.input':'constant',   'bar.z.min':-4.0, 'bar.z.max':+4.0
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
				"	var minFooY=-4.000;",
				"	var maxFooY=+4.000;",
				"	fooY=minFooY+(maxFooY-minFooY)*(ev.clientX-rect.left)/(rect.width-1);",
				"	updateFoo();",
				"});"
			]);
		});
	});
	context('with 1 mousemove component out of 3 variable vector',function(){
		var uniform=new Uniform('bar','baz','xyz',{
			'baz.x':1.0, 'baz.x.input':'constant',   'baz.x.min':-4.0, 'baz.x.max':+4.0,
			'baz.y':2.5, 'baz.y.input':'mousemovey', 'baz.y.min':-4.0, 'baz.y.max':+4.0,
			'baz.z':3.0, 'baz.z.input':'constant',   'baz.z.min':-4.0, 'baz.z.max':+4.0
		});
		it('returns interface without update fn',function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(uniform.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"var barYLoc=gl.getUniformLocation(program,'barY');",
				"gl.uniform1f(barYLoc,+2.500);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
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
		var uniform=new Uniform('bar','baz','xyz',{
			'baz.x':1.5, 'baz.x.input':'mousemovex', 'baz.x.min':-4.0, 'baz.x.max':+4.0,
			'baz.y':2.5, 'baz.y.input':'mousemovey', 'baz.y.min':-4.0, 'baz.y.max':+4.0,
			'baz.z':3.0, 'baz.z.input':'constant',   'baz.z.min':-4.0, 'baz.z.max':+4.0
		});
		it('returns interface without update fn',function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(uniform.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"var barLoc=gl.getUniformLocation(program,'bar');",
				"gl.uniform2f(barLoc,+1.500,+2.500);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
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
	context('with nonnegative limits',function(){
		var uniform=new Uniform('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'constant', 'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'constant', 'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'constant', 'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':0.5, 'shader.color.a.input':'constant', 'shader.color.a.min':0, 'shader.color.a.max':1
		});
		it('returns unsigned value',function(){
			assert.equal(uniform.getGlslValue(),
				"vec4(0.200,0.300,0.400,0.500)"
			);
		});
	});
});
