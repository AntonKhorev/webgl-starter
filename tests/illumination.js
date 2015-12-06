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
		it("has empty color attr list",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
			]);
		});
		it("declares nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines().data,[
			]);
		});
		it("outputs nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines().data,[
			]);
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
		it("has empty color attr list",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
			]);
		});
		it("declares nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines().data,[
			]);
		});
		it("outputs nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines().data,[
			]);
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
	context('with local flat shading',function(){
		var illumination=new Illumination({
			'materialScope':'vertex',
			'materialData':'one',
			'light':'off',
		});
		it("has color attr list with 1 enabled entry",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
				{name:"color",enabled:true,weight:1.0}
			]);
		});
		it("declares color input/output for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines().data,[
				"attribute vec4 color;",
				"varying vec4 interpolatedColor;"
			]);
		});
		it("outputs color input for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines().data,[
				"interpolatedColor=color;"
			]);
		});
		it("declares color input for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"varying vec4 interpolatedColor;"
			]);
		});
		it("outputs color input for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines().data,[
				"gl_FragColor=interpolatedColor;"
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
	context('with global ambient flat shading',function(){
		var illumination=new Illumination({
			'materialScope':'global',
			'materialData':'sda',
			'light':'off',
			'materialSpecularColor.r':0.9, 'materialSpecularColor.r.input':'constant', 'materialSpecularColor.r.min':0, 'materialSpecularColor.r.max':1,
			'materialSpecularColor.g':0.7, 'materialSpecularColor.g.input':'constant', 'materialSpecularColor.g.min':0, 'materialSpecularColor.g.max':1,
			'materialSpecularColor.b':0.5, 'materialSpecularColor.b.input':'constant', 'materialSpecularColor.b.min':0, 'materialSpecularColor.b.max':1,
			'materialDiffuseColor.r' :0.8, 'materialDiffuseColor.r.input' :'constant', 'materialDiffuseColor.r.min' :0, 'materialDiffuseColor.r.max' :1,
			'materialDiffuseColor.g' :0.6, 'materialDiffuseColor.g.input' :'constant', 'materialDiffuseColor.g.min' :0, 'materialDiffuseColor.g.max' :1,
			'materialDiffuseColor.b' :0.4, 'materialDiffuseColor.b.input' :'constant', 'materialDiffuseColor.b.min' :0, 'materialDiffuseColor.b.max' :1,
			'materialAmbientColor.r' :0.7, 'materialAmbientColor.r.input' :'constant', 'materialAmbientColor.r.min' :0, 'materialAmbientColor.r.max' :1,
			'materialAmbientColor.g' :0.5, 'materialAmbientColor.g.input' :'constant', 'materialAmbientColor.g.min' :0, 'materialAmbientColor.g.max' :1,
			'materialAmbientColor.b' :0.3, 'materialAmbientColor.b.input' :'constant', 'materialAmbientColor.b.min' :0, 'materialAmbientColor.b.max' :1
		});
		it("has empty color attr list",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
			]);
		});
		it("declares nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines().data,[
			]);
		});
		it("outputs nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines().data,[
			]);
		});
		it("declares nothing for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
			]);
		});
		it("outputs constant literal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines().data,[
				"gl_FragColor=vec4(0.700,0.500,0.300,1.000);"
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
	context('with global ambient flat shading and 2 slider inputs',function(){
		var illumination=new Illumination({
			'materialScope':'global',
			'materialData':'sda',
			'light':'off',
			'materialSpecularColor.r':0.9, 'materialSpecularColor.r.input':'constant', 'materialSpecularColor.r.min':0, 'materialSpecularColor.r.max':1,
			'materialSpecularColor.g':0.7, 'materialSpecularColor.g.input':'slider',   'materialSpecularColor.g.min':0, 'materialSpecularColor.g.max':1,
			'materialSpecularColor.b':0.5, 'materialSpecularColor.b.input':'constant', 'materialSpecularColor.b.min':0, 'materialSpecularColor.b.max':1,
			'materialDiffuseColor.r' :0.8, 'materialDiffuseColor.r.input' :'constant', 'materialDiffuseColor.r.min' :0, 'materialDiffuseColor.r.max' :1,
			'materialDiffuseColor.g' :0.6, 'materialDiffuseColor.g.input' :'constant', 'materialDiffuseColor.g.min' :0, 'materialDiffuseColor.g.max' :1,
			'materialDiffuseColor.b' :0.4, 'materialDiffuseColor.b.input' :'constant', 'materialDiffuseColor.b.min' :0, 'materialDiffuseColor.b.max' :1,
			'materialAmbientColor.r' :0.7, 'materialAmbientColor.r.input' :'constant', 'materialAmbientColor.r.min' :0, 'materialAmbientColor.r.max' :1,
			'materialAmbientColor.g' :0.5, 'materialAmbientColor.g.input' :'constant', 'materialAmbientColor.g.min' :0, 'materialAmbientColor.g.max' :1,
			'materialAmbientColor.b' :0.3, 'materialAmbientColor.b.input' :'slider',   'materialAmbientColor.b.min' :0, 'materialAmbientColor.b.max' :1
		});
		it("declares nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines().data,[
			]);
		});
		it("outputs nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines().data,[
			]);
		});
		it("declares uniform float (skipping unused specular color) for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"uniform float ambientColorB;"
			]);
		});
		it("outputs literal with 1 variable for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines().data,[
				"gl_FragColor=vec4(0.700,0.500,ambientColorB,1.000);"
			]);
		});
		it("returns slider js interface (skipping unused specular color)",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(illumination.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"var ambientColorBLoc=gl.getUniformLocation(program,'ambientColorB');",
				"function updateAmbientColor() {",
				"	gl.uniform1f(ambientColorBLoc,parseFloat(document.getElementById('materialAmbientColor.b').value));",
				"}",
				"updateAmbientColor();",
				"document.getElementById('materialAmbientColor.b').addEventListener('change',updateAmbientColor);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
			]);
		});
	});
	context('with global ambient flat shading and complete slider inputs',function(){
		var illumination=new Illumination({
			'materialScope':'global',
			'materialData':'sda',
			'light':'off',
			'materialSpecularColor.r':0.9, 'materialSpecularColor.r.input':'slider',   'materialSpecularColor.r.min':0, 'materialSpecularColor.r.max':1,
			'materialSpecularColor.g':0.7, 'materialSpecularColor.g.input':'slider',   'materialSpecularColor.g.min':0, 'materialSpecularColor.g.max':1,
			'materialSpecularColor.b':0.5, 'materialSpecularColor.b.input':'slider',   'materialSpecularColor.b.min':0, 'materialSpecularColor.b.max':1,
			'materialDiffuseColor.r' :0.8, 'materialDiffuseColor.r.input' :'slider',   'materialDiffuseColor.r.min' :0, 'materialDiffuseColor.r.max' :1,
			'materialDiffuseColor.g' :0.6, 'materialDiffuseColor.g.input' :'slider',   'materialDiffuseColor.g.min' :0, 'materialDiffuseColor.g.max' :1,
			'materialDiffuseColor.b' :0.4, 'materialDiffuseColor.b.input' :'slider',   'materialDiffuseColor.b.min' :0, 'materialDiffuseColor.b.max' :1,
			'materialAmbientColor.r' :0.7, 'materialAmbientColor.r.input' :'slider',   'materialAmbientColor.r.min' :0, 'materialAmbientColor.r.max' :1,
			'materialAmbientColor.g' :0.5, 'materialAmbientColor.g.input' :'slider',   'materialAmbientColor.g.min' :0, 'materialAmbientColor.g.max' :1,
			'materialAmbientColor.b' :0.3, 'materialAmbientColor.b.input' :'slider',   'materialAmbientColor.b.min' :0, 'materialAmbientColor.b.max' :1
		});
		it("declares nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines().data,[
			]);
		});
		it("outputs nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines().data,[
			]);
		});
		it("declares uniform vec3 (skipping unused specular and diffuse colors) for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"uniform vec3 ambientColor;"
			]);
		});
		it("outputs literal with vec3 for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines().data,[
				"gl_FragColor=vec4(ambientColor,1.000);"
			]);
		});
	});
	context('with local ambient flat shading',function(){
		var illumination=new Illumination({
			'materialScope':'vertex',
			'materialData':'sda',
			'light':'off',
		});
		it("has color attr list with 2 disabled and 1 enabled entry",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
				{name:"specularColor",enabled:false,weight:0.4},
				{name:"diffuseColor" ,enabled:false,weight:0.4},
				{name:"ambientColor" ,enabled:true ,weight:0.2}
			]);
		});
		it("declares color input (ambient only) and 1 color output for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines().data,[
				"attribute vec4 ambientColor;",
				"varying vec4 interpolatedColor;"
			]);
		});
		it("outputs ambient color input for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines().data,[
				"interpolatedColor=ambientColor;"
			]);
		});
		it("declares color input for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"varying vec4 interpolatedColor;"
			]);
		});
		it("outputs color input for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines().data,[
				"gl_FragColor=interpolatedColor;"
			]);
		});
	});
	context('with global color and light',function(){
		var illumination=new Illumination({
			'materialScope':'global',
			'materialData':'one',
			'light':'on',
			'materialColor.r':0.9, 'materialColor.r.input':'constant', 'materialColor.r.min':0, 'materialColor.r.max':1,
			'materialColor.g':0.7, 'materialColor.g.input':'constant', 'materialColor.g.min':0, 'materialColor.g.max':1,
			'materialColor.b':0.5, 'materialColor.b.input':'constant', 'materialColor.b.min':0, 'materialColor.b.max':1,
			'materialColor.a':1.0, 'materialColor.a.input':'constant', 'materialColor.a.min':0, 'materialColor.a.max':1,
			'lightDirection.x':+2.0, 'lightDirection.x.input':'constant', 'lightDirection.x.min':-4, 'lightDirection.x.max':+4,
			'lightDirection.y':-1.5, 'lightDirection.y.input':'constant', 'lightDirection.y.min':-4, 'lightDirection.y.max':+4,
			'lightDirection.z':+0.5, 'lightDirection.z.input':'constant', 'lightDirection.z.min':-4, 'lightDirection.z.max':+4
		});
		it("has empty color attr list",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
			]);
		});
		it("declares normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines().data,[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			]);
		});
		it("outputs normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines().data,[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			]);
		});
		it("declares normal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"varying vec3 interpolatedNormal;"
			]);
		});
		it("outputs diffuse-only lighting for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines().data,[
				"vec3 N=normalize(interpolatedNormal);",
				"if (!gl_FrontFacing) N=-N;",
				"vec3 L=normalize(vec3(+2.000,-1.500,+0.500));",
				"gl_FragColor=vec4(vec3(0.900,0.700,0.500)*max(0.0,dot(L,N)),1.000);"
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
	context('with global color and light input',function(){
		var illumination=new Illumination({
			'materialScope':'global',
			'materialData':'one',
			'light':'on',
			'materialColor.r':0.9, 'materialColor.r.input':'constant', 'materialColor.r.min':0, 'materialColor.r.max':1,
			'materialColor.g':0.7, 'materialColor.g.input':'constant', 'materialColor.g.min':0, 'materialColor.g.max':1,
			'materialColor.b':0.5, 'materialColor.b.input':'constant', 'materialColor.b.min':0, 'materialColor.b.max':1,
			'materialColor.a':1.0, 'materialColor.a.input':'constant', 'materialColor.a.min':0, 'materialColor.a.max':1,
			'lightDirection.x':+2.0, 'lightDirection.x.input':'slider'  , 'lightDirection.x.min':-4, 'lightDirection.x.max':+4,
			'lightDirection.y':-1.5, 'lightDirection.y.input':'constant', 'lightDirection.y.min':-4, 'lightDirection.y.max':+4,
			'lightDirection.z':+0.5, 'lightDirection.z.input':'constant', 'lightDirection.z.min':-4, 'lightDirection.z.max':+4
		});
		it("has empty color attr list",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
			]);
		});
		it("declares normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines().data,[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			]);
		});
		it("outputs normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines().data,[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			]);
		});
		it("declares normal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"uniform float lightDirectionX;",
				"varying vec3 interpolatedNormal;"
			]);
		});
		it("outputs diffuse-only lighting for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines().data,[
				"vec3 N=normalize(interpolatedNormal);",
				"if (!gl_FrontFacing) N=-N;",
				"vec3 L=normalize(vec3(lightDirectionX,-1.500,+0.500));",
				"gl_FragColor=vec4(vec3(0.900,0.700,0.500)*max(0.0,dot(L,N)),1.000);"
			]);
		});
		it("returns light direction slider js interface",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(illumination.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"var lightDirectionXLoc=gl.getUniformLocation(program,'lightDirectionX');",
				"function updateLightDirection() {",
				"	gl.uniform1f(lightDirectionXLoc,parseFloat(document.getElementById('lightDirection.x').value));",
				"}",
				"updateLightDirection();",
				"document.getElementById('lightDirection.x').addEventListener('change',updateLightDirection);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
			]);
		});
	});
});
