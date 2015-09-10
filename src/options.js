Option=function(name,availableValues,defaultValue){
	this.name=name;
	this.availableValues=availableValues; // for range its [min,max,step]
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
Option.prototype.getMin=function(){
	return this.availableValues[0];
}
Option.prototype.getMax=function(){
	return this.availableValues[1];
}
Option.prototype.getStep=function(){
	if (this.availableValues.length>=3) {
		return this.availableValues[2];
	} else {
		return 'any';
	}
}
Option.prototype.getMinLabel=function(){
	return this.getMin().toString().replace('-','−');
};
Option.prototype.getMaxLabel=function(){
	return this.getMax().toString().replace('-','−');
};

CheckboxOption=function(name,defaultValue){
	Option.call(this,name,[false,true],defaultValue);
};
CheckboxOption.prototype=Object.create(Option.prototype);
CheckboxOption.prototype.constructor=Option;

var Options=function(){
	this.reset();
};
Options.prototype.generalOptions=[
	new Option('background',['none','solid']),
	new Option('shader',['single','vertex']),
	new Option('shape',['square','triangle','gasket']),
	new Option('animation',['none','rotation']),
];
Options.prototype.inputOptions=[
	new Option('background.solid.color.r',[0,1],1),
	new Option('background.solid.color.g',[0,1],1),
	new Option('background.solid.color.b',[0,1],1),
	new Option('background.solid.color.a',[0,1],1),
	new Option('shader.single.color.r',[0,1],1),
	new Option('shader.single.color.g',[0,1]),
	new Option('shader.single.color.b',[0,1]),
	new Option('shader.single.color.a',[0,1],1),
	new Option('shape.gasket.depth',[0,10,1],6),
	new Option('animation.rotation.speed',[-1,1],0.2),
];
Options.prototype.debugOptions=[
	new CheckboxOption('debug.shader',true),
];
Options.prototype.reset=function(){
	this.generalOptions.forEach(function(option){
		this[option.name]=option.defaultValue;
	},this);
	this.inputOptions.forEach(function(option){
		this[option.name]=option.defaultValue;
		this[option.name+'.input']='constant';
	},this);
	this.debugOptions.forEach(function(option){
		this[option.name]=option.defaultValue;
	},this);
};
Options.prototype.hasInputs=function(){
	return this.inputOptions.some(function(option){
		return this[option.name+'.input']!='constant';
	},this);
};
Options.prototype.hasInputsFor=function(prefix){
	return this.inputOptions.filter(function(option){
		return option.name.indexOf(prefix+'.')===0;
	},this).some(function(option){
		return this[option.name+'.input']!='constant';
	},this);
};
Options.prototype.hasAllInputsFor=function(prefix){
	return this.inputOptions.filter(function(option){
		return option.name.indexOf(prefix+'.')===0;
	},this).every(function(option){
		return this[option.name+'.input']!='constant';
	},this);
};
Options.prototype.getOnlyInputFor=function(prefix){
	var matchedOptions=this.inputOptions.filter(function(option){
		return option.name.indexOf(prefix+'.')===0 && this[option.name+'.input']!='constant';
	},this);
	if (matchedOptions.length==1) {
		return matchedOptions[0];
	} else {
		return null;
	}
};
Options.prototype.cloneWithoutHidden=function(){
	// clone and set .input=constant for hidden sections
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
			newOptions[option.name+'.input']='constant';
		} else {
			newOptions[option.name+'.input']=this[option.name+'.input'];
		}
	},this);
	this.debugOptions.forEach(function(option){
		newOptions[option.name]=this[option.name];
	},this);
	return newOptions;
};

module.exports=Options;
