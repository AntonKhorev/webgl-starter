'use strict';

const Lines=require('./lines.js');
const GlslVector=require('./glsl-vector.js');

const Illumination=function(material,light){
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
			this.colorVector=new GlslVector('color',material.color);
		} else if (light.type!='off') {
			this.specularColorVector=new GlslVector('specularColor',material.specularColor);
			this.diffuseColorVector =new GlslVector('diffuseColor' ,material.diffuseColor);
			this.ambientColorVector =new GlslVector('ambientColor' ,material.ambientColor);
		} else {
			/* TODO this won't work
			const ExtendedOptions=function(){
				['Specular','Diffuse','Ambient'].forEach(function(colorType){
					this['material'+colorType+'Color.a']=1;
					this['material'+colorType+'Color.a.input']='constant';
					this['material'+colorType+'Color.a.min']=0;
					this['material'+colorType+'Color.a.max']=1;
				},this);
			};
			ExtendedOptions.prototype=options;
			var extendedOptions=new ExtendedOptions;
			this.specularColorVector=new GlslVector('specularColor','materialSpecularColor','rgba',extendedOptions);
			this.diffuseColorVector =new GlslVector('diffuseColor' ,'materialDiffuseColor' ,'rgba',extendedOptions);
			this.ambientColorVector =new GlslVector('ambientColor' ,'materialAmbientColor' ,'rgba',extendedOptions);
			*/
		}
	}
	if (light.type!='off') {
		this.lightDirectionVector=new GlslVector('lightDirection',light.direction);
	}
};
Illumination.prototype.getColorAttrs=function(){
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
};
Illumination.prototype.wantsTransformedPosition=function(eyeAtInfinity){
	return !eyeAtInfinity && this.light.type!='off' && this.material.data!='one';
};
Illumination.prototype.getGlslVertexDeclarationLines=function(eyeAtInfinity,hasNormalAttr){
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
};
Illumination.prototype.getGlslVertexOutputLines=function(eyeAtInfinity,hasNormalAttr,normalTransformLines){
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
};
Illumination.prototype.getGlslFragmentDeclarationLines=function(eyeAtInfinity){
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
};
Illumination.prototype.getGlslFragmentOutputLines=function(eyeAtInfinity,twoSided){
	const lines=new Lines;
	let colorRGB,colorA,colorRGBA;
	if (this.material.scope=='global') {
		var vector=(this.material.data=='one'
			? this.colorVector
			: this.ambientColorVector
		);
		colorRGB=vector.getGlslComponentsValue('rgb');
		colorA=vector.getGlslComponentsValue('a');
		colorRGBA=vector.getGlslValue();
	} else {
		colorRGB="interpolatedColor.rgb"; // TODO don't pass it as vec4 if light is on
		colorA="interpolatedColor.a";
		colorRGBA="interpolatedColor";
	}
	if (this.light.type=='off') {
		lines.a("gl_FragColor="+colorRGBA+";");
	} else {
		lines.a("vec3 N=normalize(interpolatedNormal);");
		if (twoSided) {
			lines.a("if (!gl_FrontFacing) N=-N;");
		}
		lines.a("vec3 L=normalize("+this.lightDirectionVector.getGlslValue()+");");
		if (this.material.data=='one') {
			lines.a(
				"gl_FragColor=vec4("+colorRGB+"*max(0.0,dot(L,N)),"+colorA+");"
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
};
Illumination.prototype.getJsInterfaceLines=function(writeListenerArgs,canvasMousemoveListener){
	const lines=new Lines;
	if (this.material.scope=='global') {
		if (this.material.data=='one') {
			lines.a(this.colorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
		} else {
			if (this.light.type!='off') {
				lines.a(this.specularColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
				lines.a(this.diffuseColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
			}
			lines.a(this.ambientColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
		}
	}
	if (this.light.type!='off') {
		lines.a(this.lightDirectionVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
	}
	return lines;
};

module.exports=Illumination;
