var Colorgen=function(){
	this.nextIndex=0;
};
Colorgen.prototype.baseColors=[
	[1.0, 0.0, 0.0],
	[0.0, 1.0, 0.0],
	[0.0, 0.0, 1.0],
	[1.0, 1.0, 0.0],
	[1.0, 0.0, 1.0],
	[0.0, 1.0, 1.0],
];
Colorgen.prototype.getNextColorString=function(){
	var baseColor=this.baseColors[this.nextIndex];
	this.nextIndex=(this.nextIndex+1)%this.baseColors.length;
	return baseColor.map(function(c){
		return " "+c.toFixed(1)+",";
	}).join("");
};

module.exports=Colorgen;
