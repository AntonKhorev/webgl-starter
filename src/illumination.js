var Lines=require('./lines.js');
var GlslVector=require('./glsl-vector.js');

var Illumination=function(options){
	this.options=options;
	if (options.materialScope=='global' && options.materialData=='one' && options.light=='off') {
		this.colorVector=new GlslVector('color','materialColor','rgba',options);
	} else if (options.shader=='light') {
		this.lightDirectionVector=new GlslVector('lightDirection','lightDirection','xyz',options);
	}
};
Illumination.prototype.getGlslFragmentDeclarationLines=function(){
	var options=this.options;
	if (options.materialScope=='global' && options.materialData=='one' && options.light=='off') {
		return this.colorVector.getGlslDeclarationLines();
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
	} else {
		return new Lines;
	}
};
Illumination.prototype.getJsInterfaceLines=function(writeListenerArgs,canvasMousemoveListener){
	var options=this.options;
	if (options.materialScope=='global' && options.materialData=='one' && options.light=='off') {
		return this.colorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener);
	} else if (this.options.shader=='light') {
		return this.lightDirectionVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener);
	} else {
		return new Lines;
	}
};

module.exports=Illumination;
