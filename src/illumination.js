var Lines=require('./lines.js');
var GlslVector=require('./glsl-vector.js');

var Illumination=function(options){
	this.options=options;
	// options.materialScope=='global': constant or user input -> uniform
	// options.materialScope!='global': colors in model data -> attribute
	// options.materialData=='one': one color
	// options.materialData!='one': s/d/a colors
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
	/* else if (options.shader=='light') { // TODO remove options.shader references
		this.lightDirectionVector=new GlslVector('lightDirection','lightDirection','xyz',options);
	}*/
};
Illumination.prototype.getColorAttrNames=function(){
	var options=this.options;
	if (options.materialScope=='global') {
		return [];
	} else {
		if (options.materialData=='one') {
			return ["color"];
		} else {
			return ["specularColor","diffuseColor","ambientColor"];
		}
	}
};
Illumination.prototype.getColorAttrEnables=function(){
	var options=this.options;
	if (options.materialScope=='global') {
		return [];
	} else {
		if (options.materialData=='one') {
			return [true];
		} else {
			return [false,false,true];
		}
	}
};
Illumination.prototype.getGlslVertexDeclarationLines=function(){
	var options=this.options;
	if (options.materialScope!='global') {
		if (options.materialData=='one') {
			return new Lines(
				"attribute vec4 color;",
				"varying vec4 interpolatedColor;"
			);
		} else {
			return new Lines(
				"attribute vec4 ambientColor;",
				"varying vec4 interpolatedColor;"
			);
		}
	} else {
		return new Lines;
	}
};
Illumination.prototype.getGlslVertexOutputLines=function(){
	var options=this.options;
	if (options.materialScope!='global') {
		if (options.materialData=='one') {
			return new Lines(
				"interpolatedColor=color;"
			);
		} else {
			return new Lines(
				"interpolatedColor=ambientColor;"
			);
		}
	} else {
		return new Lines;
	}
};
Illumination.prototype.getGlslFragmentDeclarationLines=function(){
	var options=this.options;
	if (options.materialScope=='global') {
		if (options.materialData=='one') {
			return this.colorVector.getGlslDeclarationLines();
		} else {
			return this.ambientColorVector.getGlslDeclarationLines();
		}
	} else {
		return new Lines(
			"varying vec4 interpolatedColor;"
		);
	}
};
Illumination.prototype.getGlslFragmentOutputLines=function(){
	var options=this.options;
	if (options.materialScope=='global') {
		if (options.materialData=='one') {
			return new Lines(
				"gl_FragColor="+this.colorVector.getGlslValue()+";"
			);
		} else {
			return new Lines(
				"gl_FragColor="+this.ambientColorVector.getGlslValue()+";"
			);
		}
	} else {
		return new Lines(
			"gl_FragColor=interpolatedColor;"
		);
	}
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
