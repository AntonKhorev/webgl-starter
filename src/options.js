Option=function(name,availableValues,defaultValue){
	this.name=name;
	this.availableValues=availableValues;
	if (defaultValue===undefined) {
		this.defaultValue=availableValues[0];
	} else {
		this.defaultValue=defaultValue;
	}
};
Option.prototype.doesValueHideOption=function(value,option){
	function optionStartsWith(prefix) {
		return option.name.indexOf(prefix)===0;
	}
	return optionStartsWith(this.name+'.') && !optionStartsWith(this.name+'.'+value+'.');
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
	new Option('animation.rotation.speed',[-1,1],0.2),
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
Options.prototype.cloneWithoutHidden=function(){
	// clone and set .input=false for hidden sections
	var newOptions=new Options();
	this.generalOptions.forEach(function(option){
		newOptions[option.name]=this[option.name];
	},this);
	this.inputOptions.forEach(function(option){
		newOptions[option.name]=this[option.name];
		if (
			this.generalOptions.some(function(generalOption){
				return generalOption.doesValueHideOption(this[generalOption.name],option);
			},this)
		) {
			newOptions[option.name+'.input']=false;
		} else {
			newOptions[option.name+'.input']=this[option.name+'.input'];
		}
	},this);
	return newOptions;
};

module.exports=Options;
