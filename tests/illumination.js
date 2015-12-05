var assert=require('assert');

var Illumination=require('../src/illumination.js');
var listeners=require('../src/listeners.js');

describe('Illumination',function(){
	context('with global flat shading',function(){
		var illumination=new Illumination({
			'materialScope':'global',
			'materialData':'one',
			'light':'off',
			'materialColor.r':0.9, 'materialColor.r.input':'constant', 'materialColor.r.min':0, 'materialColor.r.max':1,
			'materialColor.g':0.7, 'materialColor.g.input':'constant', 'materialColor.g.min':0, 'materialColor.g.max':1,
			'materialColor.b':0.5, 'materialColor.b.input':'constant', 'materialColor.b.min':0, 'materialColor.b.max':1,
			'materialColor.a':1.0, 'materialColor.a.input':'constant', 'materialColor.a.min':0, 'materialColor.a.max':1
		});
		it("declares nothing for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
			]);
		});
		it("outputs constant literal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines().data,[
				"gl_FragColor=vec4(0.900,0.700,0.500,1.000);"
			]);
		});
		it("returns empty js interface",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(illumination.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
			]);
		});
	});
	context('with global flat shading and slider input',function(){
		var illumination=new Illumination({
			'materialScope':'global',
			'materialData':'one',
			'light':'off',
			'materialColor.r':0.9, 'materialColor.r.input':'slider',   'materialColor.r.min':0, 'materialColor.r.max':1,
			'materialColor.g':0.7, 'materialColor.g.input':'constant', 'materialColor.g.min':0, 'materialColor.g.max':1,
			'materialColor.b':0.5, 'materialColor.b.input':'constant', 'materialColor.b.min':0, 'materialColor.b.max':1,
			'materialColor.a':1.0, 'materialColor.a.input':'constant', 'materialColor.a.min':0, 'materialColor.a.max':1
		});
		it("declares 1 uniform float for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"uniform float colorR;"
			]);
		});
		it("outputs literal with 1 variable for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines().data,[
				"gl_FragColor=vec4(colorR,0.700,0.500,1.000);"
			]);
		});
		it("returns slider js interface",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(illumination.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"var colorRLoc=gl.getUniformLocation(program,'colorR');",
				"function updateColor() {",
				"	gl.uniform1f(colorRLoc,parseFloat(document.getElementById('materialColor.r').value));",
				"}",
				"updateColor();",
				"document.getElementById('materialColor.r').addEventListener('change',updateColor);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
			]);
		});
	});
});
