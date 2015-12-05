var Lines=require('./lines.js');
var GlslVector=require('./glsl-vector.js');

var Coloring=function(options){
	this.options=options;
	if (options.shader=='single') {
		this.colorVector=new GlslVector('color','materialColor','rgba',options);
	} else if (options.shader=='light') {
		this.lightDirectionVector=new GlslVector('lightDirection','lightDirection','xyz',options);
	}
};
Coloring.prototype.getGlslFragmentDeclarationLines=function(){
	if (this.options.shader=='single') {
		return this.colorVector.getGlslDeclarationLines();
	} else {
		return new Lines;
	}
};
Coloring.prototype.getGlslFragmentOutputLines=function(){
	if (this.options.shader=='single') {
		return new Lines(
			"gl_FragColor="+this.colorVector.getGlslValue()+";"
		);
	} else {
		return new Lines;
	}
};
Coloring.prototype.getJsInterfaceLines=function(writeListenerArgs,canvasMousemoveListener){
	if (this.options.shader=='single') {
		return this.colorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener);
	} else if (this.options.shader=='light') {
		return this.lightDirectionVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener);
	} else {
		return new Lines;
	}
};

module.exports=Coloring;
