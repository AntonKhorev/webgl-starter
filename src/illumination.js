var Lines=require('./lines.js');
var GlslVector=require('./glsl-vector.js');

var Illumination=function(options){
	this.options=options;
	// possible options checks:
	// options.materialScope=='global': constant or user input -> uniform
	// options.materialScope!='global': colors in model data -> attribute
	// options.materialData=='one': one color
	// options.materialData!='one': s/d/a colors
	// options.light=='on'
	// options.light!='on'
	if (options.materialScope=='global') {
		if (options.materialData=='one') {
			this.colorVector=new GlslVector('color','materialColor','rgba',options);
		} else if (options.light=='on') {
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
	if (options.light=='on') {
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
				{name:"specularColor",enabled:options.light=='on',weight:0.4},
				{name:"diffuseColor" ,enabled:options.light=='on',weight:0.4},
				{name:"ambientColor" ,enabled:true               ,weight:0.2}
			];
		}
	}
};
Illumination.prototype.getGlslVertexDeclarationLines=function(hasNormalAttr){
	var options=this.options;
	var lines=new Lines;
	if (options.light=='on') {
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
			if (options.light=='on') {
				lines.a(
					"attribute vec3 specularColor;",
					"attribute vec3 diffuseColor;",
					"attribute vec3 ambientColor;",
					"varying vec3 interpolatedSpecularColor;",
					"varying vec3 interpolatedDiffuseColor;",
					"varying vec3 interpolatedAmbientColor;"
				);
			} else {
				lines.a("attribute vec4 ambientColor;");
				lines.a("varying vec4 interpolatedColor;");
			}
		}
	}
	return lines;
};
Illumination.prototype.getGlslVertexOutputLines=function(hasNormalAttr,normalTransformLines){
	var options=this.options;
	var lines=new Lines;
	if (options.light=='on') {
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
			if (options.light=='on') {
				lines.a(
					"interpolatedSpecularColor=specularColor;",
					"interpolatedDiffuseColor=diffuseColor;",
					"interpolatedAmbientColor=ambientColor;"
				);
			} else {
				lines.a("interpolatedColor=ambientColor;");
			}
		}
	}
	return lines;
};
Illumination.prototype.getGlslFragmentDeclarationLines=function(){
	var options=this.options;
	var lines=new Lines;
	if (options.light=='on') {
		lines.a(
			this.lightDirectionVector.getGlslDeclarationLines(),
			"varying vec3 interpolatedNormal;"
		);
	}
	if (options.materialScope=='global') {
		if (options.materialData=='one') {
			lines.a(this.colorVector.getGlslDeclarationLines());
		} else {
			if (options.light=='on') {
				lines.a(this.specularColorVector.getGlslDeclarationLines());
				lines.a(this.diffuseColorVector.getGlslDeclarationLines());
			}
			lines.a(this.ambientColorVector.getGlslDeclarationLines());
		}
	} else {
		if (options.materialData=='one' || options.light!='on') {
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
Illumination.prototype.getGlslFragmentOutputLines=function(){
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
	if (options.light=='on') {
		lines.a(
			"vec3 N=normalize(interpolatedNormal);",
			"if (!gl_FrontFacing) N=-N;",
			"vec3 L=normalize("+this.lightDirectionVector.getGlslValue()+");"
		);
		if (options.materialData=='one') {
			lines.a(
				"gl_FragColor=vec4("+colorRGB+"*max(0.0,dot(L,N)),"+colorA+");"
			);
		} else {
			lines.a(
				"vec3 V=vec3(0.0,0.0,1.0);", // TODO pass view for perspective proj
				"vec3 H=normalize(L+V);",
				"float shininess=100.0;"
			);
			lines.a((options.materialScope=='global'
				? new Lines(
					"+"+this.specularColorVector.getGlslValue()+"*pow(max(0.0,dot(H,N)),shininess)",
					"+"+this.diffuseColorVector.getGlslValue()+"*max(0.0,dot(L,N))",
					"+"+this.ambientColorVector.getGlslValue()
				)
				: new Lines(
					"+interpolatedSpecularColor*pow(max(0.0,dot(H,N)),shininess)",
					"+interpolatedDiffuseColor*max(0.0,dot(L,N))",
					"+interpolatedAmbientColor"
				)
			).wrap(
				"gl_FragColor=vec4(",
				",1.0);"
			));
		}
	} else {
		lines.a("gl_FragColor="+colorRGBA+";");
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
			if (options.light=='on') {
				lines.a(this.specularColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
				lines.a(this.diffuseColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
			}
			lines.a(this.ambientColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
		}
	}
	if (options.light=='on') {
		lines.a(this.lightDirectionVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener));
	}
	return lines;
};

module.exports=Illumination;
