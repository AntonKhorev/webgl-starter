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
			this.specularColorVector=new GlslVector('specularColor','materialSpecularColor','rgb',options);
			this.diffuseColorVector =new GlslVector('diffuseColor' ,'materialDiffuseColor' ,'rgb',options);
			this.ambientColorVector =new GlslVector('ambientColor' ,'materialAmbientColor' ,'rgb',options);
		}
	}
	/* else if (options.shader=='light') { // TODO remove options.shader references
		this.lightDirectionVector=new GlslVector('lightDirection','lightDirection','xyz',options);
	}*/
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
				"attribute vec4 specularColor; // unused",
				"attribute vec4 diffuseColor; // unused",
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
			return new Lines(
				this.specularColorVector.getGlslDeclarationLines(),
				this.diffuseColorVector.getGlslDeclarationLines(),
				this.ambientColorVector.getGlslDeclarationLines()
			);
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
			return new Lines(
				this.specularColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener),
				this.diffuseColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener),
				this.ambientColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener)
			);
		}
	} else {
		return new Lines;
	}
	/* else if (this.options.shader=='light') { // TODO remove options.shader references
		return this.lightDirectionVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener);
	}*/
};

module.exports=Illumination;
