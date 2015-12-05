var Lines=require('./lines.js');
var GlslVector=require('./glsl-vector.js');

var Illumination=function(options){
	this.options=options;
	// options.materialScope=='global': constant or user input -> uniform
	// options.materialScope!='global': colors in model data -> attribute
	if (options.materialScope=='global' && options.materialData=='one' && options.light=='off') {
		this.colorVector=new GlslVector('color','materialColor','rgba',options);
	}/* else if (options.shader=='light') { // TODO remove options.shader references
		this.lightDirectionVector=new GlslVector('lightDirection','lightDirection','xyz',options);
	}*/
};
Illumination.prototype.getGlslVertexDeclarationLines=function(){
	var options=this.options;
	if (options.materialScope!='global') {
		return new Lines(
			"attribute vec4 color;",
			"varying vec4 interpolatedColor;"
		);
	} else {
		return new Lines;
	}
};
Illumination.prototype.getGlslVertexOutputLines=function(){
	var options=this.options;
	if (options.materialScope!='global') {
		return new Lines(
			"interpolatedColor=color;"
		);
	} else {
		return new Lines;
	}
};
Illumination.prototype.getGlslFragmentDeclarationLines=function(){
	var options=this.options;
	if (options.materialScope=='global' && options.materialData=='one' && options.light=='off') {
		return this.colorVector.getGlslDeclarationLines();
	} else if (options.materialScope!='global') {
		return new Lines(
			"varying vec4 interpolatedColor;"
		);
	} else {
		return new Lines;
	}
};
Illumination.prototype.getGlslFragmentOutputLines=function(){
	var options=this.options;
	if (options.materialScope=='global' && options.materialData=='one' && options.light=='off') {
		return new Lines(
			"gl_FragColor="+this.colorVector.getGlslValue()+";"
		);
	} else if (options.materialScope!='global') {
		return new Lines(
			"gl_FragColor=interpolatedColor;"
		);
	} else {
		return new Lines;
	}
};
Illumination.prototype.getJsInterfaceLines=function(writeListenerArgs,canvasMousemoveListener){
	var options=this.options;
	if (options.materialScope=='global' && options.materialData=='one' && options.light=='off') {
		return this.colorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener);
	}/* else if (this.options.shader=='light') { // TODO remove options.shader references
		return this.lightDirectionVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener);
	}*/ else {
		return new Lines;
	}
};

module.exports=Illumination;
