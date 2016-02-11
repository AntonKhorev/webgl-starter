'use strict';

const Option=require('./option-classes.js');
const Lines=require('crnx-base/lines');
const Feature=require('./feature.js');
const GlslVector=require('./glsl-vector.js');

class Illumination extends Feature {
	constructor(material,light) {
		super();
		this.material=material;
		this.light=light;
		// possible options checks:
		// material.scope=='global': constant or user input -> uniform
		// material.scope!='global': colors in model data -> attribute
		// material.data=='one': one color
		// material.data!='one': s/d/a colors
		// light.type=='off'
		// light.type!='off'
		// light.type=='blinn'
		if (material.scope=='global') {
			if (material.data=='one') {
				this.features.push(
					this.colorVector=new GlslVector('material.color',material.color.entries)
				);
			} else if (light.type!='off') {
				this.features.push(
					this.specularColorVector=new GlslVector('material.specularColor',material.specularColor.entries),
					this.diffuseColorVector =new GlslVector('material.diffuseColor' ,material.diffuseColor.entries),
					this.ambientColorVector =new GlslVector('material.ambientColor' ,material.ambientColor.entries)
				);
			} else {
				this.features.push(
					this.ambientColorVector=new GlslVector('material.ambientColor',[
						...material.ambientColor.entries, (new Option.LiveFloat('a',[0,1,-1,+1],1)).fix()
					])
				);
				// TODO consider extendind .specularColor and .diffuseColor, b/c they would be present if vertex scope is chosen
			}
		}
		if (light.type!='off') {
			this.features.push(
				this.lightDirectionVector=new GlslVector('light.direction',light.direction.entries)
			);
		}
	}
	getColorAttrs() {
		if (this.material.scope=='global') {
			return [];
		} else {
			if (this.material.data=='one') {
				return [
					{name:"color",enabled:true,weight:1.0}
				];
			} else {
				return [
					{name:"specularColor",enabled:this.light.type!='off',weight:0.4},
					{name:"diffuseColor" ,enabled:this.light.type!='off',weight:0.4},
					{name:"ambientColor" ,enabled:true                  ,weight:0.2}
				];
			}
		}
	}
	wantsTransformedPosition(eyeAtInfinity) {
		return !eyeAtInfinity && this.light.type!='off' && this.material.data!='one';
	}
	getGlslVertexDeclarationLines(eyeAtInfinity,hasNormalAttr) {
		const lines=new Lines;
		if (this.wantsTransformedPosition(eyeAtInfinity)) {
			lines.a("varying vec3 interpolatedView;");
		}
		if (this.light.type!='off') {
			if (hasNormalAttr) {
				lines.a("attribute vec3 normal;");
			}
			lines.a("varying vec3 interpolatedNormal;");
		}
		if (this.material.scope!='global') {
			if (this.material.data=='one') {
				lines.a("attribute vec4 color;");
				lines.a("varying vec4 interpolatedColor;");
			} else {
				if (this.light.type=='off') {
					lines.a("attribute vec4 ambientColor;");
					lines.a("varying vec4 interpolatedColor;");
				} else {
					lines.a(
						"attribute vec3 specularColor;",
						"attribute vec3 diffuseColor;",
						"attribute vec3 ambientColor;",
						"varying vec3 interpolatedSpecularColor;",
						"varying vec3 interpolatedDiffuseColor;",
						"varying vec3 interpolatedAmbientColor;"
					);
				}
			}
		}
		return lines;
	}
	getGlslVertexOutputLines(eyeAtInfinity,hasNormalAttr,normalTransformLines) {
		const lines=new Lines;
		if (this.wantsTransformedPosition(eyeAtInfinity)) {
			lines.a("interpolatedView=-transformedPosition.xyz;");
		}
		if (this.light.type!='off') {
			lines.a("interpolatedNormal=");
			if (hasNormalAttr) {
				lines.t("normal");
			} else {
				lines.t("vec3(0.0,0.0,1.0)");
			}
			lines.t(normalTransformLines);
			lines.t(";");
		}
		if (this.material.scope!='global') {
			if (this.material.data=='one') {
				lines.a("interpolatedColor=color;");
			} else {
				if (this.light.type=='off') {
					lines.a("interpolatedColor=ambientColor;");
				} else {
					lines.a(
						"interpolatedSpecularColor=specularColor;",
						"interpolatedDiffuseColor=diffuseColor;",
						"interpolatedAmbientColor=ambientColor;"
					);
				}
			}
		}
		return lines;
	}
	getGlslFragmentDeclarationLines(eyeAtInfinity) {
		const lines=new Lines;
		if (this.wantsTransformedPosition(eyeAtInfinity)) {
			lines.a("varying vec3 interpolatedView;");
		}
		if (this.light.type!='off') {
			lines.a(
				this.lightDirectionVector.getGlslDeclarationLines(),
				"varying vec3 interpolatedNormal;"
			);
		}
		if (this.material.scope=='global') {
			if (this.material.data=='one') {
				lines.a(this.colorVector.getGlslDeclarationLines());
			} else {
				if (this.light.type!='off') {
					lines.a(this.specularColorVector.getGlslDeclarationLines());
					lines.a(this.diffuseColorVector.getGlslDeclarationLines());
				}
				lines.a(this.ambientColorVector.getGlslDeclarationLines());
			}
		} else {
			if (this.material.data=='one' || this.light.type=='off') {
				lines.a("varying vec4 interpolatedColor;");
			} else {
				lines.a(
					"varying vec3 interpolatedSpecularColor;",
					"varying vec3 interpolatedDiffuseColor;",
					"varying vec3 interpolatedAmbientColor;"
				);
			}
		}
		return lines;
	}
	getGlslFragmentOutputLines(eyeAtInfinity,twoSided) {
		const lines=new Lines;
		let colorRGB,colorA,colorRGBA;
		if (this.material.scope=='global') {
			const vector=(this.material.data=='one'
				? this.colorVector
				: this.ambientColorVector
			);
			colorRGB =()=>vector.getGlslComponentsValue('rgb');
			colorA   =()=>vector.getGlslComponentsValue('a');
			colorRGBA=()=>vector.getGlslValue();
		} else {
			colorRGB =()=>"interpolatedColor.rgb"; // TODO don't pass it as vec4 if light is on
			colorA   =()=>"interpolatedColor.a";
			colorRGBA=()=>"interpolatedColor";
		}
		if (this.light.type=='off') {
			lines.a("gl_FragColor="+colorRGBA()+";");
		} else {
			lines.a("vec3 N=normalize(interpolatedNormal);");
			if (twoSided) {
				lines.a("if (!gl_FrontFacing) N=-N;");
			}
			lines.a("vec3 L=normalize("+this.lightDirectionVector.getGlslValue()+");");
			if (this.material.data=='one') {
				lines.a(
					"gl_FragColor=vec4("+colorRGB()+"*max(0.0,dot(L,N)),"+colorA()+");"
				);
			} else {
				if (this.wantsTransformedPosition(eyeAtInfinity)) {
					lines.a("vec3 V=normalize(interpolatedView);");
				} else {
					lines.a("vec3 V=vec3(0.0,0.0,1.0);");
				}
				let specularDotArgs="H,N";
				let shininessCorrection="";
				if (this.light.type=='blinn') {
					lines.a("vec3 H=normalize(L+V);");
				} else {
					lines.a("vec3 R=reflect(-L,N);");
					specularDotArgs="R,V";
					shininessCorrection="/4.0";
				}
				lines.a("float shininess=100.0;");
				lines.a((this.material.scope=='global'
					? new Lines(
						"+"+this.specularColorVector.getGlslValue()+"*pow(max(0.0,dot("+specularDotArgs+")),shininess"+shininessCorrection+")",
						"+"+this.diffuseColorVector.getGlslValue()+"*max(0.0,dot(L,N))",
						"+"+this.ambientColorVector.getGlslValue()
					)
					: new Lines(
						"+interpolatedSpecularColor*pow(max(0.0,dot("+specularDotArgs+")),shininess"+shininessCorrection+")",
						"+interpolatedDiffuseColor*max(0.0,dot(L,N))",
						"+interpolatedAmbientColor"
					)
				).wrap(
					"gl_FragColor=vec4(",
					",1.0);"
				));
			}
		}
		return lines;
	}
}

module.exports=Illumination;
