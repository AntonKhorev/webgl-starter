var assert=require('assert');

var Illumination=require('../src/illumination.js');

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
		it("returns empty fragment declaration",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
			]);
		});
		it("returns literal fragment output",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines().data,[
				"gl_FragColor=vec4(0.900,0.700,0.500,1.000);"
			]);
		});
	});
});
