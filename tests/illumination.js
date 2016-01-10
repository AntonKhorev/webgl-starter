'use strict';

const assert=require('assert');
const Lines=require('../src/lines.js');
const Options=require('../src/options.js');
const FeatureContext=require('../src/feature-context.js');
const Illumination=require('../src/illumination.js');

describe('Illumination',function(){
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				// options relevant for this Feature, copied here in case defaults change
				['Group','material',[
					['Select','scope',['global','vertex','face']],
					['Select','data',['one','sda']],
					['LiveColor','color',[1,0,0,1],{'material.scope':'global','material.data':'one'}],
					['LiveColor','specularColor',[0.4,0.4,0.4],{'material.scope':'global','material.data':'sda'}],
					['LiveColor','diffuseColor' ,[0.4,0.4,0.4],{'material.scope':'global','material.data':'sda'}],
					['LiveColor','ambientColor' ,[0.2,0.2,0.2],{'material.scope':'global','material.data':'sda'}],
				]],
				['Group','light',[
					['Select','type',['off','phong','blinn']],
					['Group','direction',[
						['LiveFloat','x',[-4,+4,-4,+4],-1],
						['LiveFloat','y',[-4,+4,-4,+4],+1],
						['LiveFloat','z',[-4,+4,-4,+4],+1],
					],{'light.type':['phong','blinn']}],
				]],
			];
		}
	}
	context('with global flat shading',function(){
		const options=(new TestOptions({
			material:{
				color:{r:0.9, g:0.7, b:0.5, a:1.0},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
			]);
		});
		it("outputs constant literal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
				"gl_FragColor=vec4(0.900,0.700,0.500,1.000);"
			]);
		});
		it("returns empty js interface",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).data,[
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context('with global flat shading and slider input',function(){
		const options=(new TestOptions({
			material:{
				color:{r:{value:0.9, input:'slider'}, g:0.7, b:0.5, a:1.0},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
				"uniform float colorR;"
			]);
		});
		it("outputs literal with 1 variable for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
				"gl_FragColor=vec4(colorR,0.700,0.500,1.000);"
			]);
		});
		it("returns slider js interface",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).data,[
				"var colorRLoc=gl.getUniformLocation(program,'colorR');",
				"function updateColor() {",
				"	gl.uniform1f(colorRLoc,parseFloat(document.getElementById('color.r').value));",
				"}",
				"updateColor();",
				"document.getElementById('color.r').addEventListener('change',updateColor);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context('with local flat shading',function(){
		const options=(new TestOptions({
			material:{
				scope:'vertex',
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
				"varying vec4 interpolatedColor;"
			]);
		});
		it("outputs color input for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
				"gl_FragColor=interpolatedColor;"
			]);
		});
		it("returns empty js interface",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).data,[
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context('with global ambient flat shading',function(){
		const options=(new TestOptions({
			material:{
				data:'sda',
				specularColor:{r:0.9, g:0.7, b:0.5},
				diffuseColor :{r:0.8, g:0.6, b:0.4},
				ambientColor :{r:0.7, g:0.5, b:0.3},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
			]);
		});
		it("outputs constant literal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
				"gl_FragColor=vec4(0.700,0.500,0.300,1.000);"
			]);
		});
		it("returns empty js interface",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).data,[
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context('with global ambient flat shading and 2 slider inputs',function(){
		const options=(new TestOptions({
			material:{
				data:'sda',
				specularColor:{r:0.9, g:{value:0.7, input:'slider'}, b:0.5},
				diffuseColor :{r:0.8, g:0.6, b:0.4},
				ambientColor :{r:0.7, g:0.5, b:{value:0.3, input:'slider'}},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
				"uniform float ambientColorB;"
			]);
		});
		it("outputs literal with 1 variable for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
				"gl_FragColor=vec4(0.700,0.500,ambientColorB,1.000);"
			]);
		});
		it("returns slider js interface (skipping unused specular color)",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).data,[
				"var ambientColorBLoc=gl.getUniformLocation(program,'ambientColorB');",
				"function updateAmbientColor() {",
				"	gl.uniform1f(ambientColorBLoc,parseFloat(document.getElementById('ambientColor.b').value));",
				"}",
				"updateAmbientColor();",
				"document.getElementById('ambientColor.b').addEventListener('change',updateAmbientColor);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context('with global ambient flat shading and complete slider inputs',function(){
		const options=(new TestOptions({
			material:{
				data:'sda',
				specularColor:{r:{value:0.9, input:'slider'}, g:{value:0.7, input:'slider'}, b:{value:0.5, input:'slider'}},
				diffuseColor :{r:{value:0.8, input:'slider'}, g:{value:0.6, input:'slider'}, b:{value:0.4, input:'slider'}},
				ambientColor :{r:{value:0.7, input:'slider'}, g:{value:0.5, input:'slider'}, b:{value:0.3, input:'slider'}},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
				"uniform vec3 ambientColor;"
			]);
		});
		it("outputs literal with vec3 for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
				"gl_FragColor=vec4(ambientColor,1.000);"
			]);
		});
	});
	context('with local ambient flat shading',function(){
		const options=(new TestOptions({
			material:{
				scope:'vertex',
				data:'sda',
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
				"varying vec4 interpolatedColor;"
			]);
		});
		it("outputs color input for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
				"gl_FragColor=interpolatedColor;"
			]);
		});
	});
	context('with global color and light',function(){
		const options=(new TestOptions({
			material:{
				color:{r:0.9, g:0.7, b:0.5, a:1.0},
			},
			light:{
				type:'blinn',
				direction:{x:+2.0, y:-1.5, z:+0.5},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			const tr=new Lines;
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
				"varying vec3 interpolatedNormal;"
			]);
		});
		it("declares normal (and no view) for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(false).data,[
				"varying vec3 interpolatedNormal;"
			]);
		});
		it("outputs diffuse-only lighting for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
				"vec3 N=normalize(interpolatedNormal);",
				"vec3 L=normalize(vec3(+2.000,-1.500,+0.500));",
				"gl_FragColor=vec4(vec3(0.900,0.700,0.500)*max(0.0,dot(L,N)),1.000);"
			]);
		});
		it("returns empty js interface",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).data,[
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context('with global color and light input',function(){
		const options=(new TestOptions({
			material:{
				color:{r:0.9, g:0.7, b:0.5, a:1.0},
			},
			light:{
				type:'blinn',
				direction:{x:{value:+2.0, input:'slider'}, y:-1.5, z:+0.5},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
				"uniform float lightDirectionX;",
				"varying vec3 interpolatedNormal;"
			]);
		});
		it("outputs diffuse-only lighting for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
				"vec3 N=normalize(interpolatedNormal);",
				"vec3 L=normalize(vec3(lightDirectionX,-1.500,+0.500));",
				"gl_FragColor=vec4(vec3(0.900,0.700,0.500)*max(0.0,dot(L,N)),1.000);"
			]);
		});
		it("returns light direction slider js interface",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).data,[
				"var lightDirectionXLoc=gl.getUniformLocation(program,'lightDirectionX');",
				"function updateLightDirection() {",
				"	gl.uniform1f(lightDirectionXLoc,parseFloat(document.getElementById('lightDirection.x').value));",
				"}",
				"updateLightDirection();",
				"document.getElementById('lightDirection.x').addEventListener('change',updateLightDirection);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context('with global blinn-phong shading',function(){
		const options=(new TestOptions({
			material:{
				data:'sda',
				specularColor:{r:0.9, g:0.7, b:0.5},
				diffuseColor :{r:0.8, g:0.6, b:0.4},
				ambientColor :{r:0.7, g:0.5, b:0.3},
			},
			light:{
				type:'blinn',
				direction:{x:+2.0, y:-1.5, z:+0.5},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
				"varying vec3 interpolatedNormal;"
			]);
		});
		it("declares view and normal for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(false).data,[
				"varying vec3 interpolatedView;",
				"varying vec3 interpolatedNormal;"
			]);
		});
		it("outputs phong shading for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
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
		it("outputs phong shading for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false,false).data,[
				"vec3 N=normalize(interpolatedNormal);",
				"vec3 L=normalize(vec3(+2.000,-1.500,+0.500));",
				"vec3 V=normalize(interpolatedView);",
				"vec3 H=normalize(L+V);",
				"float shininess=100.0;",
				"gl_FragColor=vec4(",
				"	+vec3(0.900,0.700,0.500)*pow(max(0.0,dot(H,N)),shininess)",
				"	+vec3(0.800,0.600,0.400)*max(0.0,dot(L,N))",
				"	+vec3(0.700,0.500,0.300)",
				",1.0);"
			]);
		});
		it("outputs blinn-phong shading + normal flip for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,true).data,[
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
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).data,[
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context('with global blinn-phong shading with input',function(){
		const options=(new TestOptions({
			material:{
				data:'sda',
				specularColor:{r:{value:0.9, input:'slider'}, g:0.7, b:0.5},
				diffuseColor :{r:0.8, g:0.6, b:0.4},
				ambientColor :{r:0.7, g:0.5, b:0.3},
			},
			light:{
				type:'blinn',
				direction:{x:+2.0, y:-1.5, z:+0.5},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
				"varying vec3 interpolatedNormal;",
				"uniform float specularColorR;",
			]);
		});
		it("outputs blinn-phong shading for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
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
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).data,[
				"var specularColorRLoc=gl.getUniformLocation(program,'specularColorR');",
				"function updateSpecularColor() {",
				"	gl.uniform1f(specularColorRLoc,parseFloat(document.getElementById('specularColor.r').value));",
				"}",
				"updateSpecularColor();",
				"document.getElementById('specularColor.r').addEventListener('change',updateSpecularColor);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context('with local blinn-phong shading',function(){
		const options=(new TestOptions({
			material:{
				scope:'vertex',
				data:'sda',
			},
			light:{
				type:'blinn',
				direction:{x:+2.0, y:-1.5, z:+0.5},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
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
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).data,[
				"varying vec3 interpolatedNormal;",
				"varying vec3 interpolatedSpecularColor;",
				"varying vec3 interpolatedDiffuseColor;",
				"varying vec3 interpolatedAmbientColor;"
			]);
		});
		it("outputs blinn-phong shading for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
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
	context('with local phong shading',function(){
		const options=(new TestOptions({
			material:{
				scope:'vertex',
				data:'sda',
			},
			light:{
				type:'phong',
				direction:{x:+2.0, y:-1.5, z:+0.5},
			},
		})).fix();
		const illumination=new Illumination(options.material,options.light);
		it("outputs phong shading for fragment shader",function(){
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).data,[
				"vec3 N=normalize(interpolatedNormal);",
				"vec3 L=normalize(vec3(+2.000,-1.500,+0.500));",
				"vec3 V=vec3(0.0,0.0,1.0);",
				"vec3 R=reflect(-L,N);",
				"float shininess=100.0;",
				"gl_FragColor=vec4(",
				"	+interpolatedSpecularColor*pow(max(0.0,dot(R,V)),shininess/4.0)",
				"	+interpolatedDiffuseColor*max(0.0,dot(L,N))",
				"	+interpolatedAmbientColor",
				",1.0);"
			]);
		});
	});
});
