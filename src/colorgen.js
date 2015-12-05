var colorgenCounter=0;

var Colorgen=function(weight){
	this.weight=weight;
	this.colorgenNumber=colorgenCounter++;
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
	return baseColor.map(function(ci,i){
		var s=Math.sin(this.colorgenNumber*9000+this.nextIndex*400+i*100);
		var co=(ci*0.6+s*s*0.4)*this.weight;
		return " "+co.toFixed(1)+",";
	},this).join("");
};

module.exports=Colorgen;
