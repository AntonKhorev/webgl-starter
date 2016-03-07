'use strict'

const assert=require('assert')
const Lines=require('crnx-base/lines')
const Options=require('../src/options')
const FeatureContext=require('../src/feature-context')
const Illumination=require('../src/illumination')

describe("Illumination",()=>{
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
			]
		}
	}
	context("with global flat shading",()=>{
		const options=(new TestOptions({
			material:{
				color:{r:0.9, g:0.7, b:0.5, a:1.0},
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("has empty color attr list",()=>{
			assert.deepEqual(illumination.getColorAttrs(),[
			])
		})
		it("doesn't want transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),false)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("declares nothing for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
			])
		})
		it("outputs nothing for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
			])
		})
		it("declares nothing for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
			])
		})
		it("outputs constant literal for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
				"gl_FragColor=vec4(0.900,0.700,0.500,1.000);"
			])
		})
		it("returns empty js interface",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).get(),[
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
	})
	context("with global flat shading and slider input",()=>{
		const options=(new TestOptions({
			material:{
				color:{r:{value:0.9, input:'slider'}, g:0.7, b:0.5, a:1.0},
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("requests sliders",()=>{
			const testFeatureContext={}
			illumination.requestFeatureContext(testFeatureContext)
			assert.deepEqual(testFeatureContext,{
				hasSliders: true,
				hasInputs: true,
			})
		})
		it("has empty color attr list",()=>{
			assert.deepEqual(illumination.getColorAttrs(),[
			])
		})
		it("doesn't want transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),false)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("declares nothing for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
			])
		})
		it("outputs nothing for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
			])
		})
		it("declares 1 uniform float for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
				"uniform float materialColorR;"
			])
		})
		it("outputs literal with 1 variable for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
				"gl_FragColor=vec4(materialColorR,0.700,0.500,1.000);"
			])
		})
		it("returns slider js interface",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).get(),[
				"var materialColorRLoc=gl.getUniformLocation(program,'materialColorR')",
				"function updateMaterialColor() {",
				"	gl.uniform1f(materialColorRLoc,parseFloat(document.getElementById('material.color.r').value))",
				"}",
				"updateMaterialColor()",
				"document.getElementById('material.color.r').addEventListener('change',updateMaterialColor)"
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
	})
	context("with local flat shading",()=>{
		const options=(new TestOptions({
			material:{
				scope:'vertex',
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("has color attr list with 1 enabled entry",()=>{
			assert.deepEqual(illumination.getColorAttrs(),[
				{name:"color",enabled:true,weight:1.0}
			])
		})
		it("doesn't want transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),false)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("declares color input/output for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
				"attribute vec4 color;",
				"varying vec4 interpolatedColor;"
			])
		})
		it("outputs color input for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
				"interpolatedColor=color;"
			])
		})
		it("declares color input for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
				"varying vec4 interpolatedColor;"
			])
		})
		it("outputs color input for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
				"gl_FragColor=interpolatedColor;"
			])
		})
		it("returns empty js interface",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).get(),[
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
	})
	context("with global ambient flat shading",()=>{
		const options=(new TestOptions({
			material:{
				data:'sda',
				specularColor:{r:0.9, g:0.7, b:0.5},
				diffuseColor :{r:0.8, g:0.6, b:0.4},
				ambientColor :{r:0.7, g:0.5, b:0.3},
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("has empty color attr list",()=>{
			assert.deepEqual(illumination.getColorAttrs(),[
			])
		})
		it("doesn't want transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),false)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("declares nothing for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
			])
		})
		it("outputs nothing for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
			])
		})
		it("declares nothing for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
			])
		})
		it("outputs constant literal for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
				"gl_FragColor=vec4(0.700,0.500,0.300,1.000);"
			])
		})
		it("returns empty js interface",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).get(),[
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
	})
	context("with global ambient flat shading and 2 slider inputs",()=>{
		const options=(new TestOptions({
			material:{
				data:'sda',
				specularColor:{r:0.9, g:{value:0.7, input:'slider'}, b:0.5},
				diffuseColor :{r:0.8, g:0.6, b:0.4},
				ambientColor :{r:0.7, g:0.5, b:{value:0.3, input:'slider'}},
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("declares nothing for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
			])
		})
		it("doesn't want transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),false)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("outputs nothing for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
			])
		})
		it("declares uniform float (skipping unused specular color) for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
				"uniform float materialAmbientColorB;"
			])
		})
		it("outputs literal with 1 variable for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
				"gl_FragColor=vec4(0.700,0.500,materialAmbientColorB,1.000);"
			])
		})
		it("returns slider js interface (skipping unused specular color)",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).get(),[
				"var materialAmbientColorBLoc=gl.getUniformLocation(program,'materialAmbientColorB')",
				"function updateMaterialAmbientColor() {",
				"	gl.uniform1f(materialAmbientColorBLoc,parseFloat(document.getElementById('material.ambientColor.b').value))",
				"}",
				"updateMaterialAmbientColor()",
				"document.getElementById('material.ambientColor.b').addEventListener('change',updateMaterialAmbientColor)"
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
	})
	context("with global ambient flat shading and complete slider inputs",()=>{
		const options=(new TestOptions({
			material:{
				data:'sda',
				specularColor:{r:{value:0.9, input:'slider'}, g:{value:0.7, input:'slider'}, b:{value:0.5, input:'slider'}},
				diffuseColor :{r:{value:0.8, input:'slider'}, g:{value:0.6, input:'slider'}, b:{value:0.4, input:'slider'}},
				ambientColor :{r:{value:0.7, input:'slider'}, g:{value:0.5, input:'slider'}, b:{value:0.3, input:'slider'}},
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("declares nothing for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
			])
		})
		it("doesn't want transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),false)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("outputs nothing for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
			])
		})
		it("declares uniform vec3 (skipping unused specular and diffuse colors) for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
				"uniform vec3 materialAmbientColor;"
			])
		})
		it("outputs literal with vec3 for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
				"gl_FragColor=vec4(materialAmbientColor,1.000);"
			])
		})
	})
	context("with local ambient flat shading",()=>{
		const options=(new TestOptions({
			material:{
				scope:'vertex',
				data:'sda',
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("has color attr list with 2 disabled and 1 enabled entry",()=>{
			assert.deepEqual(illumination.getColorAttrs(),[
				{name:"specularColor",enabled:false,weight:0.4},
				{name:"diffuseColor" ,enabled:false,weight:0.4},
				{name:"ambientColor" ,enabled:true ,weight:0.2}
			])
		})
		it("doesn't want transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),false)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("declares color input (ambient only) and 1 color output for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
				"attribute vec4 ambientColor;",
				"varying vec4 interpolatedColor;"
			])
		})
		it("outputs ambient color input for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
				"interpolatedColor=ambientColor;"
			])
		})
		it("declares color input for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
				"varying vec4 interpolatedColor;"
			])
		})
		it("outputs color input for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
				"gl_FragColor=interpolatedColor;"
			])
		})
	})
	context("with global color and light",()=>{
		const options=(new TestOptions({
			material:{
				color:{r:0.9, g:0.7, b:0.5, a:1.0},
			},
			light:{
				type:'blinn',
				direction:{x:+2.0, y:-1.5, z:+0.5},
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("has empty color attr list",()=>{
			assert.deepEqual(illumination.getColorAttrs(),[
			])
		})
		it("doesn't want transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),false)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("declares normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			])
		})
		it("declares normal (and no view) for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(false,false).get(),[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			])
		})
		it("declares shape normal and output normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,true).get(),[
				"attribute vec3 normal;",
				"varying vec3 interpolatedNormal;"
			])
		})
		it("outputs normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			])
		})
		it("outputs normal (and no view) for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(false,false,Lines.be()).get(),[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			])
		})
		it("outputs transformed normal for vertex shader",()=>{
			const tr=Lines.bae(
				"*do(",
				"	magic",
				")"
			)
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,tr).get(),[
				"interpolatedNormal=vec3(0.0,0.0,1.0)*do(",
				"	magic",
				");"
			])
		})
		it("outputs shape normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,true,Lines.be()).get(),[
				"interpolatedNormal=normal;"
			])
		})
		it("declares normal for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
				"varying vec3 interpolatedNormal;"
			])
		})
		it("declares normal (and no view) for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(false).get(),[
				"varying vec3 interpolatedNormal;"
			])
		})
		it("outputs diffuse-only lighting for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
				"vec3 N=normalize(interpolatedNormal);",
				"vec3 L=normalize(vec3(+2.000,-1.500,+0.500));",
				"gl_FragColor=vec4(vec3(0.900,0.700,0.500)*max(0.0,dot(L,N)),1.000);"
			])
		})
		it("returns empty js interface",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).get(),[
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
	})
	context("with global color and light input",()=>{
		const options=(new TestOptions({
			material:{
				color:{r:0.9, g:0.7, b:0.5, a:1.0},
			},
			light:{
				type:'blinn',
				direction:{x:{value:+2.0, input:'slider'}, y:-1.5, z:+0.5},
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("has empty color attr list",()=>{
			assert.deepEqual(illumination.getColorAttrs(),[
			])
		})
		it("doesn't want transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),false)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("declares normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			])
		})
		it("outputs normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			])
		})
		it("declares normal for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
				"uniform float lightDirectionX;",
				"varying vec3 interpolatedNormal;"
			])
		})
		it("outputs diffuse-only lighting for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
				"vec3 N=normalize(interpolatedNormal);",
				"vec3 L=normalize(vec3(lightDirectionX,-1.500,+0.500));",
				"gl_FragColor=vec4(vec3(0.900,0.700,0.500)*max(0.0,dot(L,N)),1.000);"
			])
		})
		it("returns light direction slider js interface",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).get(),[
				"var lightDirectionXLoc=gl.getUniformLocation(program,'lightDirectionX')",
				"function updateLightDirection() {",
				"	gl.uniform1f(lightDirectionXLoc,parseFloat(document.getElementById('light.direction.x').value))",
				"}",
				"updateLightDirection()",
				"document.getElementById('light.direction.x').addEventListener('change',updateLightDirection)"
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
	})
	context("with global blinn-phong shading",()=>{
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
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("has empty color attr list",()=>{
			assert.deepEqual(illumination.getColorAttrs(),[
			])
		})
		it("wants transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),true)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("declares normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			])
		})
		it("declares view and normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(false,false).get(),[
				"varying vec3 interpolatedView;",
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			])
		})
		it("outputs normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			])
		})
		it("outputs view and normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(false,false,Lines.be()).get(),[
				"interpolatedView=-transformedPosition.xyz;",
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			])
		})
		it("declares normal for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
				"varying vec3 interpolatedNormal;"
			])
		})
		it("declares view and normal for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(false).get(),[
				"varying vec3 interpolatedView;",
				"varying vec3 interpolatedNormal;"
			])
		})
		it("outputs phong shading for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
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
			])
		})
		it("outputs phong shading for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(false,false).get(),[
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
			])
		})
		it("outputs blinn-phong shading + normal flip for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,true).get(),[
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
			])
		})
		it("returns empty js interface",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).get(),[
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
	})
	context("with global blinn-phong shading with input",()=>{
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
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("has empty color attr list",()=>{
			assert.deepEqual(illumination.getColorAttrs(),[
			])
		})
		it("wants transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),true)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("declares normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
				"varying vec3 interpolatedNormal;" // TODO optimize this out after case w/ transforms passes
			])
		})
		it("outputs normal for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
				"interpolatedNormal=vec3(0.0,0.0,1.0);"
			])
		})
		it("declares normal and color component for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
				"varying vec3 interpolatedNormal;",
				"uniform float materialSpecularColorR;",
			])
		})
		it("outputs blinn-phong shading for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
				"vec3 N=normalize(interpolatedNormal);",
				"vec3 L=normalize(vec3(+2.000,-1.500,+0.500));",
				"vec3 V=vec3(0.0,0.0,1.0);",
				"vec3 H=normalize(L+V);",
				"float shininess=100.0;",
				"gl_FragColor=vec4(",
				"	+vec3(materialSpecularColorR,0.700,0.500)*pow(max(0.0,dot(H,N)),shininess)",
				"	+vec3(0.800,0.600,0.400)*max(0.0,dot(L,N))",
				"	+vec3(0.700,0.500,0.300)",
				",1.0);"
			])
		})
		it("returns color component slider js interface",()=>{
			const featureContext=new FeatureContext(false)
			featureContext.hasStartTime=true // animated
			assert.deepEqual(illumination.getJsInitLines(featureContext).get(),[
				"var materialSpecularColorRLoc=gl.getUniformLocation(program,'materialSpecularColorR')",
				"function updateMaterialSpecularColor() {",
				"	gl.uniform1f(materialSpecularColorRLoc,parseFloat(document.getElementById('material.specularColor.r').value))",
				"}",
				"updateMaterialSpecularColor()",
				"document.getElementById('material.specularColor.r').addEventListener('change',updateMaterialSpecularColor)"
			])
			assert.deepEqual(featureContext.getJsAfterInitLines().get(),[
			])
		})
	})
	context("with local blinn-phong shading",()=>{
		const options=(new TestOptions({
			material:{
				scope:'vertex',
				data:'sda',
			},
			light:{
				type:'blinn',
				direction:{x:+2.0, y:-1.5, z:+0.5},
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("has color attr list with 3 enabled entries",()=>{
			assert.deepEqual(illumination.getColorAttrs(),[
				{name:"specularColor",enabled:true,weight:0.4},
				{name:"diffuseColor" ,enabled:true,weight:0.4},
				{name:"ambientColor" ,enabled:true,weight:0.2}
			])
		})
		it("wants transformed position for finite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(false),true)
		})
		it("doesn't want transformed position for infinite view distance",()=>{
			assert.equal(illumination.wantsTransformedPosition(true),false)
		})
		it("declares 3 color inputs/outputs for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexDeclarationLines(true,false).get(),[
				"varying vec3 interpolatedNormal;",
				"attribute vec3 specularColor;",
				"attribute vec3 diffuseColor;",
				"attribute vec3 ambientColor;",
				"varying vec3 interpolatedSpecularColor;",
				"varying vec3 interpolatedDiffuseColor;",
				"varying vec3 interpolatedAmbientColor;"
			])
		})
		it("outputs normal and 3 color inputs for vertex shader",()=>{
			assert.deepEqual(illumination.getGlslVertexOutputLines(true,false,Lines.be()).get(),[
				"interpolatedNormal=vec3(0.0,0.0,1.0);",
				"interpolatedSpecularColor=specularColor;",
				"interpolatedDiffuseColor=diffuseColor;",
				"interpolatedAmbientColor=ambientColor;"
			])
		})
		it("declares normal and 3 color inputs for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentDeclarationLines(true).get(),[
				"varying vec3 interpolatedNormal;",
				"varying vec3 interpolatedSpecularColor;",
				"varying vec3 interpolatedDiffuseColor;",
				"varying vec3 interpolatedAmbientColor;"
			])
		})
		it("outputs blinn-phong shading for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
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
			])
		})
	})
	context("with local phong shading",()=>{
		const options=(new TestOptions({
			material:{
				scope:'vertex',
				data:'sda',
			},
			light:{
				type:'phong',
				direction:{x:+2.0, y:-1.5, z:+0.5},
			},
		})).fix()
		const illumination=new Illumination(options.material,options.light)
		it("outputs phong shading for fragment shader",()=>{
			assert.deepEqual(illumination.getGlslFragmentOutputLines(true,false).get(),[
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
			])
		})
	})
})
