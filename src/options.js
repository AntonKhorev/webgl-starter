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
	new Option('background.solid.color.r',[0,1],1),
	new Option('background.solid.color.g',[0,1],1),
	new Option('background.solid.color.b',[0,1],1),
	new Option('background.solid.color.a',[0,1],1),
	new Option('fragmentColor.r',[0,1],1),
	new Option('fragmentColor.g',[0,1]),
	new Option('fragmentColor.b',[0,1]),
	new Option('fragmentColor.a',[0,1],1),
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
Options.prototype.hasInputs=function(){
	return this.inputOptions.some(function(option){
		return this[option.name+'.input'];
	},this);
};
Options.prototype.hasInputsFor=function(prefix){
	return this.inputOptions.filter(function(option){
		return option.name.indexOf(prefix+'.')===0;
	},this).some(function(option){
		return this[option.name+'.input'];
	},this);
};
Options.prototype.hasAllInputsFor=function(prefix){
	return this.inputOptions.filter(function(option){
		return option.name.indexOf(prefix+'.')===0;
	},this).every(function(option){
		return this[option.name+'.input'];
	},this);
};
Options.prototype.getOnlyInputFor=function(prefix){
	var matchedOptions=this.inputOptions.filter(function(option){
		return option.name.indexOf(prefix+'.')===0 && this[option.name+'.input'];
	},this);
	if (matchedOptions.length==1) {
		return matchedOptions[0];
	} else {
		return null;
	}
};

module.exports=Options;
