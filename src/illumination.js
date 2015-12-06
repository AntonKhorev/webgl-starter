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
				{name:"specularColor",enabled:false,weight:0.4},
				{name:"diffuseColor" ,enabled:false,weight:0.4},
				{name:"ambientColor" ,enabled:true ,weight:0.2}
			];
		}
	}
};
Illumination.prototype.getGlslVertexDeclarationLines=function(){
	var options=this.options;
	var lines=new Lines;
	if (options.light=='on') {
		lines.a("varying vec3 interpolatedNormal;");
	}
	if (options.materialScope!='global') {
		if (options.materialData=='one') {
			lines.a("attribute vec4 color;");
		} else {
			lines.a("attribute vec4 ambientColor;");
		}
		lines.a("varying vec4 interpolatedColor;");
	}
	return lines;
};
Illumination.prototype.getGlslVertexOutputLines=function(){
	var options=this.options;
	var lines=new Lines;
	if (options.light=='on') {
		lines.a("interpolatedNormal=vec3(0.0,0.0,1.0);");
	}
	if (options.materialScope!='global') {
		if (options.materialData=='one') {
			lines.a("interpolatedColor=color;");
		} else {
			lines.a("interpolatedColor=ambientColor;");
		}
	}
	return lines;
};
Illumination.prototype.getGlslFragmentDeclarationLines=function(){
	var options=this.options;
	var lines=new Lines;
	if (options.light=='on') {
		lines.a("varying vec3 interpolatedNormal;");
	}
	if (options.materialScope=='global') {
		if (options.materialData=='one') {
			lines.a(this.colorVector.getGlslDeclarationLines());
		} else {
			lines.a(this.ambientColorVector.getGlslDeclarationLines());
		}
	} else {
		lines.a("varying vec4 interpolatedColor;");
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
		colorRGB="interpolatedColor.rgb";
		colorA="interpolatedColor.a";
		colorRGBA="interpolatedColor";
	}
	if (options.light=='on') {
		lines.a(
			"vec3 N=normalize(interpolatedNormal);",
			"if (!gl_FrontFacing) N=-N;",
			"vec3 L=normalize("+this.lightDirectionVector.getGlslValue()+");",
			"gl_FragColor=vec4("+colorRGB+"*max(0.0,dot(L,N)),"+colorA+");"
		);
	} else {
		lines.a("gl_FragColor="+colorRGBA+";");
	}
	return lines;
};
Illumination.prototype.getJsInterfaceLines=function(writeListenerArgs,canvasMousemoveListener){
	var options=this.options;
	if (options.materialScope=='global') {
		if (options.materialData=='one') {
			return this.colorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener);
		} else {
			return this.ambientColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener);
		}
	} else {
		return new Lines;
	}
	/* else if (this.options.shader=='light') { // TODO remove options.shader references
		return this.lightDirectionVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener);
	}*/
};

module.exports=Illumination;
