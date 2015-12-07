var assert=require('assert');
var Lines=require('../src/lines.js');
var listeners=require('../src/listeners.js');
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
		it("has empty color attr list",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
			]);
		});
		it("doesn't want transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),false);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("declares nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
			]);
		});
		it("outputs nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
			]);
		});
		it("declares nothing for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
			]);
		});
		it("outputs constant literal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
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
		it("doesn't want transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),false);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("declares nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
			]);
		});
		it("outputs nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
			]);
		});
		it("declares 1 uniform float for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"uniform float colorR;"
			]);
		});
		it("outputs literal with 1 variable for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
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
		it("doesn't want transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),false);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("declares color input/output for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
				"attribute vec4 color;",
				"varying vec4 interpolatedColor;"
			]);
		});
		it("outputs color input for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
				"interpolatedColor=color;"
			]);
		});
		it("declares color input for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"varying vec4 interpolatedColor;"
			]);
		});
		it("outputs color input for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
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
		it("doesn't want transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),false);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("declares nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
			]);
		});
		it("outputs nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
			]);
		});
		it("declares nothing for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
			]);
		});
		it("outputs constant literal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
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
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
			]);
		});
		it("doesn't want transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),false);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("outputs nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
			]);
		});
		it("declares uniform float (skipping unused specular color) for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"uniform float ambientColorB;"
			]);
		});
		it("outputs literal with 1 variable for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
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
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
			]);
		});
		it("doesn't want transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),false);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("outputs nothing for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
			]);
		});
		it("declares uniform vec3 (skipping unused specular and diffuse colors) for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"uniform vec3 ambientColor;"
			]);
		});
		it("outputs literal with vec3 for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
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
		it("doesn't want transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),false);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("declares color input (ambient only) and 1 color output for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
				"attribute vec4 ambientColor;",
				"varying vec4 interpolatedColor;"
			]);
		});
		it("outputs ambient color input for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
				"interpolatedColor=ambientColor;"
			]);
		});
		it("declares color input for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"varying vec4 interpolatedColor;"
			]);
		});
		it("outputs color input for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
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
		it("doesn't want transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),false);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("declares normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			]);
		});
		it("declares normal (and no view) for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(false,false).data,[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			]);
		});
		it("declares shape normal and output normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,true).data,[
				"attribute vec3 normal;",
				"varying vec3 interpolatedNormal;"
			]);
		});
		it("outputs normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			]);
		});
		it("outputs normal (and no view) for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(false,false,new Lines("")).data,[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			]);
		});
		it("outputs transformed normal for vertex shader",function(){
			var tr=new Lines;
			tr.a("");
			tr.t(
				"*do(",
				"	magic",
				")"
			);
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,tr).data,[
				"interpolatedNormal=vec3(0.0,0.0,1.0)*do(",
				"	magic",
				");"
			]);
		});
		it("outputs shape normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,true,new Lines("")).data,[
				"interpolatedNormal=normal;"
			]);
		});
		it("declares normal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"varying vec3 interpolatedNormal;"
			]);
		});
		it("outputs diffuse-only lighting for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
				"vec3 N=normalize(interpolatedNormal);",
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
		it("doesn't want transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),false);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("declares normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			]);
		});
		it("outputs normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
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
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
				"vec3 N=normalize(interpolatedNormal);",
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
	context('with global phong shading',function(){
		var illumination=new Illumination({
			'materialScope':'global',
			'materialData':'sda',
			'light':'on',
			'materialSpecularColor.r':0.9, 'materialSpecularColor.r.input':'constant', 'materialSpecularColor.r.min':0, 'materialSpecularColor.r.max':1,
			'materialSpecularColor.g':0.7, 'materialSpecularColor.g.input':'constant', 'materialSpecularColor.g.min':0, 'materialSpecularColor.g.max':1,
			'materialSpecularColor.b':0.5, 'materialSpecularColor.b.input':'constant', 'materialSpecularColor.b.min':0, 'materialSpecularColor.b.max':1,
			'materialDiffuseColor.r' :0.8, 'materialDiffuseColor.r.input' :'constant', 'materialDiffuseColor.r.min' :0, 'materialDiffuseColor.r.max' :1,
			'materialDiffuseColor.g' :0.6, 'materialDiffuseColor.g.input' :'constant', 'materialDiffuseColor.g.min' :0, 'materialDiffuseColor.g.max' :1,
			'materialDiffuseColor.b' :0.4, 'materialDiffuseColor.b.input' :'constant', 'materialDiffuseColor.b.min' :0, 'materialDiffuseColor.b.max' :1,
			'materialAmbientColor.r' :0.7, 'materialAmbientColor.r.input' :'constant', 'materialAmbientColor.r.min' :0, 'materialAmbientColor.r.max' :1,
			'materialAmbientColor.g' :0.5, 'materialAmbientColor.g.input' :'constant', 'materialAmbientColor.g.min' :0, 'materialAmbientColor.g.max' :1,
			'materialAmbientColor.b' :0.3, 'materialAmbientColor.b.input' :'constant', 'materialAmbientColor.b.min' :0, 'materialAmbientColor.b.max' :1,
			'lightDirection.x':+2.0, 'lightDirection.x.input':'constant', 'lightDirection.x.min':-4, 'lightDirection.x.max':+4,
			'lightDirection.y':-1.5, 'lightDirection.y.input':'constant', 'lightDirection.y.min':-4, 'lightDirection.y.max':+4,
			'lightDirection.z':+0.5, 'lightDirection.z.input':'constant', 'lightDirection.z.min':-4, 'lightDirection.z.max':+4
		});
		it("has empty color attr list",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
			]);
		});
		it("wants transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),true);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("declares normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			]);
		});
		it("declares view and normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(false,false).data,[
				"varying vec3 interpolatedView;",
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			]);
		});
		it("outputs normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			]);
		});
		it("outputs view and normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(false,false,new Lines("")).data,[
				"interpolatedView=-transformedPosition.xyz;",
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			]);
		});
		it("declares normal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"varying vec3 interpolatedNormal;"
			]);
		});
		it("outputs phong shading for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
				"vec3 N=normalize(interpolatedNormal);",
				"vec3 L=normalize(vec3(+2.000,-1.500,+0.500));",
				"vec3 V=vec3(0.0,0.0,1.0);",
				"vec3 H=normalize(L+V);",
				"float shininess=100.0;",
				"gl_FragColor=vec4(",
				"	+vec3(0.900,0.700,0.500)*pow(max(0.0,dot(H,N)),shininess)",
				"	+vec3(0.800,0.600,0.400)*max(0.0,dot(L,N))",
				"	+vec3(0.700,0.500,0.300)",
				",1.0);"
			]);
		});
		it("outputs phong shading + normal flip for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true).data,[
				"vec3 N=normalize(interpolatedNormal);",
				"if (!gl_FrontFacing) N=-N;",
				"vec3 L=normalize(vec3(+2.000,-1.500,+0.500));",
				"vec3 V=vec3(0.0,0.0,1.0);",
				"vec3 H=normalize(L+V);",
				"float shininess=100.0;",
				"gl_FragColor=vec4(",
				"	+vec3(0.900,0.700,0.500)*pow(max(0.0,dot(H,N)),shininess)",
				"	+vec3(0.800,0.600,0.400)*max(0.0,dot(L,N))",
				"	+vec3(0.700,0.500,0.300)",
				",1.0);"
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
	context('with global phong shading with input',function(){
		var illumination=new Illumination({
			'materialScope':'global',
			'materialData':'sda',
			'light':'on',
			'materialSpecularColor.r':0.9, 'materialSpecularColor.r.input':'slider',   'materialSpecularColor.r.min':0, 'materialSpecularColor.r.max':1,
			'materialSpecularColor.g':0.7, 'materialSpecularColor.g.input':'constant', 'materialSpecularColor.g.min':0, 'materialSpecularColor.g.max':1,
			'materialSpecularColor.b':0.5, 'materialSpecularColor.b.input':'constant', 'materialSpecularColor.b.min':0, 'materialSpecularColor.b.max':1,
			'materialDiffuseColor.r' :0.8, 'materialDiffuseColor.r.input' :'constant', 'materialDiffuseColor.r.min' :0, 'materialDiffuseColor.r.max' :1,
			'materialDiffuseColor.g' :0.6, 'materialDiffuseColor.g.input' :'constant', 'materialDiffuseColor.g.min' :0, 'materialDiffuseColor.g.max' :1,
			'materialDiffuseColor.b' :0.4, 'materialDiffuseColor.b.input' :'constant', 'materialDiffuseColor.b.min' :0, 'materialDiffuseColor.b.max' :1,
			'materialAmbientColor.r' :0.7, 'materialAmbientColor.r.input' :'constant', 'materialAmbientColor.r.min' :0, 'materialAmbientColor.r.max' :1,
			'materialAmbientColor.g' :0.5, 'materialAmbientColor.g.input' :'constant', 'materialAmbientColor.g.min' :0, 'materialAmbientColor.g.max' :1,
			'materialAmbientColor.b' :0.3, 'materialAmbientColor.b.input' :'constant', 'materialAmbientColor.b.min' :0, 'materialAmbientColor.b.max' :1,
			'lightDirection.x':+2.0, 'lightDirection.x.input':'constant', 'lightDirection.x.min':-4, 'lightDirection.x.max':+4,
			'lightDirection.y':-1.5, 'lightDirection.y.input':'constant', 'lightDirection.y.min':-4, 'lightDirection.y.max':+4,
			'lightDirection.z':+0.5, 'lightDirection.z.input':'constant', 'lightDirection.z.min':-4, 'lightDirection.z.max':+4
		});
		it("has empty color attr list",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
			]);
		});
		it("wants transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),true);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("declares normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			]);
		});
		it("outputs normal for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			]);
		});
		it("declares normal and color component for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"varying vec3 interpolatedNormal;",
				"uniform float specularColorR;",
			]);
		});
		it("outputs phong shading for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
				"vec3 N=normalize(interpolatedNormal);",
				"vec3 L=normalize(vec3(+2.000,-1.500,+0.500));",
				"vec3 V=vec3(0.0,0.0,1.0);",
				"vec3 H=normalize(L+V);",
				"float shininess=100.0;",
				"gl_FragColor=vec4(",
				"	+vec3(specularColorR,0.700,0.500)*pow(max(0.0,dot(H,N)),shininess)",
				"	+vec3(0.800,0.600,0.400)*max(0.0,dot(L,N))",
				"	+vec3(0.700,0.500,0.300)",
				",1.0);"
			]);
		});
		it("returns color component slider js interface",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(illumination.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"var specularColorRLoc=gl.getUniformLocation(program,'specularColorR');",
				"function updateSpecularColor() {",
				"	gl.uniform1f(specularColorRLoc,parseFloat(document.getElementById('materialSpecularColor.r').value));",
				"}",
				"updateSpecularColor();",
				"document.getElementById('materialSpecularColor.r').addEventListener('change',updateSpecularColor);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
			]);
		});
	});
	context('with local phong shading',function(){
		var illumination=new Illumination({
			'materialScope':'vertex',
			'materialData':'sda',
			'light':'on',
			'lightDirection.x':+2.0, 'lightDirection.x.input':'constant', 'lightDirection.x.min':-4, 'lightDirection.x.max':+4,
			'lightDirection.y':-1.5, 'lightDirection.y.input':'constant', 'lightDirection.y.min':-4, 'lightDirection.y.max':+4,
			'lightDirection.z':+0.5, 'lightDirection.z.input':'constant', 'lightDirection.z.min':-4, 'lightDirection.z.max':+4
		});
		it("has color attr list with 3 enabled entries",function(){
			assert.deepEqual(illumination.getColorAttrs(),[
				{name:"specularColor",enabled:true,weight:0.4},
				{name:"diffuseColor" ,enabled:true,weight:0.4},
				{name:"ambientColor" ,enabled:true,weight:0.2}
			]);
		});
		it("wants transformed position for finite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(false),true);
		});
		it("doesn't want transformed position for infinite view distance",function(){
			assert.equal(illumination.wantsTransformedPosition(true),false);
		});
		it("declares 3 color inputs/outputs for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).data,[
				"varying vec3 interpolatedNormal;",
				"attribute vec3 specularColor;",
				"attribute vec3 diffuseColor;",
				"attribute vec3 ambientColor;",
				"varying vec3 interpolatedSpecularColor;",
				"varying vec3 interpolatedDiffuseColor;",
				"varying vec3 interpolatedAmbientColor;"
			]);
		});
		it("outputs normal and 3 color inputs for vertex shader",function(){
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,new Lines("")).data,[
				"interpolatedNormal=vec3(0.0,0.0,1.0);",
				"interpolatedSpecularColor=specularColor;",
				"interpolatedDiffuseColor=diffuseColor;",
				"interpolatedAmbientColor=ambientColor;"
			]);
		});
		it("declares normal and 3 color inputs for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines().data,[
				"varying vec3 interpolatedNormal;",
				"varying vec3 interpolatedSpecularColor;",
				"varying vec3 interpolatedDiffuseColor;",
				"varying vec3 interpolatedAmbientColor;"
			]);
		});
		it("outputs phong shading for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false).data,[
				"vec3 N=normalize(interpolatedNormal);",
				"vec3 L=normalize(vec3(+2.000,-1.500,+0.500));",
				"vec3 V=vec3(0.0,0.0,1.0);",
				"vec3 H=normalize(L+V);",
				"float shininess=100.0;",
				"gl_FragColor=vec4(",
				"	+interpolatedSpecularColor*pow(max(0.0,dot(H,N)),shininess)",
				"	+interpolatedDiffuseColor*max(0.0,dot(L,N))",
				"	+interpolatedAmbientColor",
				",1.0);"
			]);
		});
	});
});
