var Lines=require('./lines.js');

// currently supports two cases:
//	all constant components
//	x and y variable, z constant
// TODO the rest
var Uniform=function(varName,optName,components,options){
	this.varName=varName;
	this.optName=optName;
	this.components=components.split('');
	this.values=this.components.map(function(c){
		return options[optName+'.'+c];
	});
	this.allConst=this.components.every(function(c){
		return options[optName+'.'+c+'.input']=='constant'
	}); // TODO this is a temporary var - remove it
};
Uniform.prototype.getGlslDeclarationLines=function(){
	if (this.allConst) {
		return new Lines;
	} else {
		return new Lines(
			"uniform vec2 "+this.varName+";"
		);
	}
};
Uniform.prototype.getGlslValue=function(){
	function formatSignedValue(value) {
		return (value<=0 ? value<0 ? '' /* - */ : ' ' : '+')+value.toFixed(3);
	}
	if (this.allConst) {
		var x=formatSignedValue(this.values[0]);
		var y=formatSignedValue(this.values[1]);
		var z=formatSignedValue(this.values[2]);
		if (x==y && y==z) {
			return "vec3("+x+")"; // see OpenGL ES SL section 5.4.2
		} else {
			return "vec3("+x+","+y+","+z+")";
		}
	} else {
		return "vec3("+this.varName+","+formatSignedValue(this.values[2])+")";
	}
};
Uniform.prototype.getJsInterfaceLines=function(writeListenerArgs){
	function capitalize(s) {
		return s.charAt(0).toUpperCase()+s.slice(1);
	}
	if (this.allConst) {
		return new Lines;
	} else {
		var updateFnName='update'+capitalize(this.varName);
		return new Lines(
			"var "+this.varName+"Loc=gl.getUniformLocation(program,'"+this.varName+"');",
			"function "+updateFnName+"() {",
			"	gl.uniform2f("+this.varName+"Loc,",
			"		parseFloat(document.getElementById('"+this.optName+".x').value),",
			"		parseFloat(document.getElementById('"+this.optName+".y').value)",
			"	);",
			"};",
			updateFnName+"();",
			"document.getElementById('"+this.optName+".x').addEventListener('change',"+updateFnName+");",
			"document.getElementById('"+this.optName+".y').addEventListener('change',"+updateFnName+");"
		); // TODO real event listener
	}
};

module.exports=Uniform;
