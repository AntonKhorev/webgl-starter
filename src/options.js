var Option=function(name,availableValues,defaultValue){
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

var InputOption=function(name,rangeOfValues,defaultValue){
	Option.call(this,name,rangeOfValues,defaultValue);
};
InputOption.prototype=Object.create(Option.prototype);
InputOption.prototype.constructor=InputOption;
InputOption.prototype.availableInputTypes=['constant','slider','mousemovex','mousemovey'];
InputOption.prototype.getMin=function(){
	return this.availableValues[0];
};
InputOption.prototype.getMax=function(){
	return this.availableValues[1];
};
InputOption.prototype.getMinLabel=function(){
	return this.getMin().toString().replace('-','−');
};
InputOption.prototype.getMaxLabel=function(){
	return this.getMax().toString().replace('-','−');
};

var FloatInputOption=function(name,rangeOfValues,defaultValue){
	InputOption.call(this,name,rangeOfValues,defaultValue);
};
FloatInputOption.prototype=Object.create(InputOption.prototype);
FloatInputOption.prototype.constructor=FloatInputOption;
FloatInputOption.prototype.getStep=function(){
	return 'any';
};
FloatInputOption.prototype.getSetupStep=function(){
	if (this.getMax()>=100) {
		return '0.1';
	} else if (this.getMax()>=10) {
		return '0.01';
	} else {
		return '0.001';
	}
};

var IntInputOption=function(name,rangeOfValues,defaultValue){
	InputOption.call(this,name,rangeOfValues,defaultValue);
};
IntInputOption.prototype=Object.create(InputOption.prototype);
IntInputOption.prototype.constructor=IntInputOption;
IntInputOption.prototype.getStep=function(){
	return 1;
};
IntInputOption.prototype.getSetupStep=function(){
	return 1;
};

/*
var TransformOption=function(name,rangeOfValues,defaultValue){
	InputOption.call(this,name,rangeOfValues,defaultValue);
};
TransformOption.prototype=Object.create(InputOption.prototype);
TransformOption.prototype.constructor=TransformOption;
TransformOption.prototype.availableInputTypes=InputOption.prototype.availableInputTypes.concat(['animated']);
*/

var DebugOption=function(name,defaultValue){
	Option.call(this,name,[false,true],defaultValue);
};
DebugOption.prototype=Object.create(Option.prototype);
DebugOption.prototype.constructor=DebugOption;

var Options=function(){
	this.reset();
};
Options.prototype.generalOptions=[
	new Option('background',['none','solid']),
	new Option('shader',['single','vertex','face']),
	new Option('shape',['square','triangle','gasket','cube']),
];
Options.prototype.inputOptions=[
	new FloatInputOption('background.solid.color.r',[0,1],1),
	new FloatInputOption('background.solid.color.g',[0,1],1),
	new FloatInputOption('background.solid.color.b',[0,1],1),
	new FloatInputOption('background.solid.color.a',[0,1],1),
	new FloatInputOption('shader.single.color.r',[0,1],1),
	new FloatInputOption('shader.single.color.g',[0,1]),
	new FloatInputOption('shader.single.color.b',[0,1]),
	new FloatInputOption('shader.single.color.a',[0,1],1),
	new IntInputOption('shape.gasket.depth',[0,10],6),
];
Options.prototype.transformOptions=[
	// TODO make default angle/speed something like 0.2*360 when able to add/delete transforms
	new FloatInputOption('rotate.x',[-180,180],0),
	new FloatInputOption('rotate.x.speed',[-360,360],0),
	new FloatInputOption('rotate.y',[-180,180],0),
	new FloatInputOption('rotate.y.speed',[-360,360],0),
	new FloatInputOption('rotate.z',[-180,180],0),
	new FloatInputOption('rotate.z.speed',[-360,360],0),
];
Options.prototype.debugOptions=[
	new DebugOption('debugShader',true),
	new DebugOption('debugInputs'), // TODO hide if no inputs?
];
Options.prototype.reset=function(){
	this.generalOptions.forEach(function(option){
		this[option.name]=option.defaultValue;
	},this);
	this.inputOptions.forEach(function(option){
		this[option.name]=option.defaultValue;
		this[option.name+'.input']='constant';
	},this);
	this.transformOptions.forEach(function(option){
		this[option.name]=option.defaultValue;
		this[option.name+'.input']='constant';
	},this);
	this.debugOptions.forEach(function(option){
		this[option.name]=option.defaultValue;
	},this);
};

// TODO check what .has*() fns are in use
Options.prototype.hasInputs=function(){
	return this.inputOptions.some(function(option){
		return this[option.name+'.input']!='constant';
	},this) || this.transformOptions.some(function(option){
		return this[option.name+'.input']!='constant';
	},this);
};
Options.prototype.hasSliderInputs=function(){
	return this.inputOptions.some(function(option){
		return this[option.name+'.input']=='slider';
	},this) || this.transformOptions.some(function(option){
		return this[option.name+'.input']=='slider';
	},this);
};
Options.prototype.hasInputsFor=function(prefix){
	return this.inputOptions.filter(function(option){
		return option.name.indexOf(prefix+'.')===0;
	},this).some(function(option){
		return this[option.name+'.input']!='constant';
	},this);
};
Options.prototype.hasAllSliderInputsFor=function(prefix){
	return this.inputOptions.filter(function(option){
		return option.name.indexOf(prefix+'.')===0;
	},this).every(function(option){
		return this[option.name+'.input']=='slider';
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
Options.prototype.isAnimated=function(){
	function endsWith(name,suffix) {
		return name.indexOf(suffix,name.length-suffix.length)!==-1;
	};
	return this.transformOptions.some(function(option){
		return endsWith(option.name,'.speed') && (this[option.name]!=0 || this[option.name+'.input']!='constant');
	},this);
};
Options.prototype.needsUniform=function(prefix){
	return (
		this[prefix+'.input']!='constant' ||
		this[prefix+'.speed']!=0 || this[prefix+'.speed.input']!='constant'
	);
};
Options.prototype.needsTransform=function(prefix){
	return this.needsUniform(prefix) || this[prefix]!=0;
};

Options.prototype.cloneWithoutHidden=function(){
	// clone and set .input=constant for hidden sections
	var newOptions=new Options();
	this.generalOptions.forEach(function(option){
		newOptions[option.name]=this[option.name];
	},this);
	[this.inputOptions,this.transformOptions].forEach(function(section){
		section.forEach(function(option){
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
	},this);
	this.debugOptions.forEach(function(option){
		newOptions[option.name]=this[option.name];
	},this);
	return newOptions;
};

module.exports=Options;
