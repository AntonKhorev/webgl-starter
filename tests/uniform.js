var assert=require('assert');

var Uniform=require('../src/uniform.js');

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
		it('returns interface with one location and two simple listeners',function(){
			assert.deepEqual(uniform.getJsInterfaceLines([false,false]).data,[
				"var fooLoc=gl.getUniformLocation(program,'foo');",
				"function updateFoo() {",
				"	gl.uniform2f(fooLoc,",
				"		parseFloat(document.getElementById('bar.x').value),",
				"		parseFloat(document.getElementById('bar.y').value)",
				"	);",
				"};",
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
				"};",
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
});
