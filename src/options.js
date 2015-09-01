Option=function(name,availableValues,defaultValue){
	this.name=name;
	this.availableValues=availableValues;
	if (defaultValue===undefined) {
		this.defaultValue=availableValues[0];
	} else {
		this.defaultValue=defaultValue;
	}
};

var Options=function(){
	this.reset();
};
Options.prototype.generalOptions=[
	new Option('background',['none','solid']),
	new Option('shape',['square','triangle','gasket']),
	new Option('animation',['none','rotation']),
];
Options.prototype.inputOptions=[
	new Option('fragmentColorR',[0,1],1),
	new Option('fragmentColorG',[0,1]),
	new Option('fragmentColorB',[0,1]),
];
Options.prototype.reset=function(){
	this.generalOptions.forEach(function(option){
		this[option.name]=option.defaultValue;
	},this);
	this.inputOptions.forEach(function(option){
		this[option.name]=option.defaultValue;
		this[option.name+'.input']=false;
	},this);
};

module.exports=Options;
