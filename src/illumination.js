var Lines=require('./lines.js');
var GlslVector=require('./glsl-vector.js');

var Illumination=function(options){
	this.options=options;
	// possible options checks:
	// options.materialScope=='global': constant or user input -> uniform
	// options.materialScope!='global': colors in model data -> attribute
	// options.materialData=='one': one color
	// options.materialData!='one': s/d/a colors
	// options.light=='off'
	// options.light!='off'
	// options.light=='blinn'
	if (options.materialScope=='global') {
		if (options.materialData=='one') {
			this.colorVector=new GlslVector('color','materialColor','rgba',options);
		} else if (options.light!='off') {
			this.specularColorVector=new GlslVector('specularColor','materialSpecularColor','rgb',options);
			this.diffuseColorVector =new GlslVector('diffuseColor' ,'materialDiffuseColor' ,'rgb',options);
			this.ambientColorVector =new GlslVector('ambientColor' ,'materialAmbientColor' ,'rgb',options);
		} else {
			var ExtendedOptions=function(){
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
		}
	}
	if (options.light!='off') {
		this.lightDirectionVector=new GlslVector('lightDirection','lightDirection','xyz',options);
	}
};
Illumination.prototype.getColorAttrs=function(){
	var options=this.options;
	if (options.materialScope=='global') {
		return [];
	} else {
		if (options.materialData=='one') {
			return [
				{name:"color",enabled:true,weight:1.0}
			];
		} else {
			return [
				{name:"specularColor",enabled:options.light!='off',weight:0.4},
				{name:"diffuseColor" ,enabled:options.light!='off',weight:0.4},
				{name:"ambientColor" ,enabled:true                ,weight:0.2}
			];
		}
	}
};
Illumination.prototype.wantsTransformedPosition=function(eyeAtInfinity){
	var options=this.options;
	return !eyeAtInfinity && options.light!='off' && options.materialData!='one';
};
Illumination.prototype.getGlslVertexDeclarationLines=function(eyeAtInfinity,hasNormalAttr){
	var options=this.options;
	var lines=new Lines;
	if (this.wantsTransformedPosition(eyeAtInfinity)) {
		lines.a("varying vec3 interpolatedView;");
	}
	if (options.light!='off') {
		if (hasNormalAttr) {
			lines.a("attribute vec3 normal;");
		}
		lines.a("varying vec3 interpolatedNormal;");
	}
	if (options.materialScope!='global') {
		if (options.materialData=='one') {
			lines.a("attribute vec4 color;");
			lines.a("varying vec4 interpolatedColor;");
		} else {
			if (options.light=='off') {
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
	var options=this.options;
	var lines=new Lines;
	if (this.wantsTransformedPosition(eyeAtInfinity)) {
		lines.a("interpolatedView=-transformedPosition.xyz;");
	}
	if (options.light!='off') {
		lines.a("interpolatedNormal=");
		if (hasNormalAttr) {
			lines.t("normal");
		} else {
			lines.t("vec3(0.0,0.0,1.0)");
		}
		lines.t(normalTransformLines);
		lines.t(";");
	}
	if (options.materialScope!='global') {
		if (options.materialData=='one') {
			lines.a("interpolatedColor=color;");
		} else {
			if (options.light=='off') {
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
	var options=this.options;
	var lines=new Lines;
	if (this.wantsTransformedPosition(eyeAtInfinity)) {
		lines.a("varying vec3 interpolatedView;");
	}
	if (options.light!='off') {
		lines.a(
			this.lightDirectionVector.getGlslDeclarationLines(),
			"varying vec3 interpolatedNormal;"
		);
	}
	if (options.materialScope=='global') {
		if (options.materialData=='one') {
			lines.a(this.colorVector.getGlslDeclarationLines());
		} else {
			if (options.light!='off') {
				lines.a(this.specularColorVector.getGlslDeclarationLines());
				lines.a(this.diffuseColorVector.getGlslDeclarationLines());
			}
			lines.a(this.ambientColorVector.getGlslDeclarationLines());
		}
	} else {
		if (options.materialData=='one' || options.light=='off') {
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
	var options=this.options;
	var lines=new Lines;
	var colorRGB,colorA,colorRGBA;
	if (options.materialScope=='global') {
		var vector=(options.materialData=='one'
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
	if (options.light=='off') {
		lines.a("gl_FragColor="+colorRGBA+";");
	} else {
		lines.a("vec3 N=normalize(interpolatedNormal);");
		if (twoSided) {
			lines.a("if (!gl_FrontFacing) N=-N;");
		}
		lines.a("vec3 L=normalize("+this.lightDirectionVector.getGlslValue()+");");
		if (options.materialData=='one') {
			lines.a(
				"gl_FragColor=vec4("+colorRGB+"*max(0.0,dot(L,N)),"+colorA+");"
			);
		} else {
			if (this.wantsTransformedPosition(eyeAtInfinity)) {
				lines.a("vec3 V=normalize(interpolatedView);");
			} else {
				lines.a("vec3 V=vec3(0.0,0.0,1.0);");
			}
			var specularDotArgs="H,N";
			var shininessCorrection="";
			if (options.light=='blinn') {
				lines.a("vec3 H=normalize(L+V);");
			} else {
				lines.a("vec3 R=reflect(-L,N);");
				specularDotArgs="R,V";
				shininessCorrection="/4.0";
			}
			lines.a("float shininess=100.0;");
			lines.a((options.materialScope=='global'
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
	var options=this.options;
	var lines=new Lines;
	if (options.materialScope=='global') {
		if (options.materialData=='one') {
			lines.a(this.colorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
		} else {
			if (options.light!='off') {
				lines.a(this.specularColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
				lines.a(this.diffuseColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
			}
			lines.a(this.ambientColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
		}
	}
	if (options.light!='off') {
		lines.a(this.lightDirectionVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
	}
	return lines;
};

module.exports=Illumination;
