var colorgenCounter=0;

var SingleColorgen=function(weight){
	this.weight=weight;
	this.colorgenNumber=colorgenCounter++;
	this.nextIndex=0;
};
SingleColorgen.prototype.baseColors=[
	[1.0, 0.0, 0.0], // TODO 'cube' color order, when cube is not ugly
	[0.0, 1.0, 0.0],
	[0.0, 0.0, 1.0],
	[1.0, 1.0, 0.0],
	[1.0, 0.0, 1.0],
	[0.0, 1.0, 1.0],
];
SingleColorgen.prototype.getNextColorString=function(){
	var baseColor=this.baseColors[this.nextIndex];
	this.nextIndex=(this.nextIndex+1)%this.baseColors.length;
	return baseColor.map(function(ci,i){
		var s=Math.sin(this.colorgenNumber*9000+this.nextIndex*400+i*100);
		var co=(ci*0.6+s*s*0.4)*this.weight;
		return " "+co.toFixed(1)+",";
	},this).join("");
};

var Colorgen=function(colorAttrs){
	this.colorAttrs=colorAttrs;
	this.singleColorgens=this.colorAttrs.map(function(attr){
		return new SingleColorgen(attr.weight);
	});
};
Colorgen.prototype.getHeaderString=function(){
	return this.colorAttrs.map(function(){
		return "    r    g    b";
	}).join("");
};
Colorgen.prototype.getNextColorString=function(){
	return this.singleColorgens.map(function(singleColorgen){
		return singleColorgen.getNextColorString();
	}).join("");
};

module.exports=Colorgen;
