var Option=function(name,availableValues,defaultValue){
	this.name=name;
	this.availableValues=availableValues; // for range its [min,max,step]
	if (defaultValue===undefined) {
		this.defaultValue=availableValues[0];
	} else {
		this.defaultValue=defaultValue;
	}
};
Option.prototype.getSuboptionScopePrefix=function(){
	return this.name+'.';
}
Option.prototype.getSuboptionHitPrefix=function(value){
	if (this.name=='shape' && ['gasket','hat','terrain'].indexOf(value)>=0) {
		value='lodShape';
	}
	return this.getSuboptionScopePrefix()+value+'.';
}
Option.prototype.doesValueHideOption=function(value,option){
	function optionStartsWith(prefix) {
		return option.name.indexOf(prefix)===0;
	}
	return optionStartsWith(
		this.getSuboptionScopePrefix()
	) && !optionStartsWith(
		this.getSuboptionHitPrefix(value)
	);
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
InputOption.prototype.getMinLabel=function(value){
	if (value===undefined) value=this.getMin();
	return value.toString().replace('-','−');
};
InputOption.prototype.getMaxLabel=function(value){
	if (value===undefined) value=this.getMax();
	return value.toString().replace('-','−');
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

var CanvasIntInputOption=function(name,rangeOfValues,defaultValue){
	IntInputOption.call(this,name,rangeOfValues,defaultValue);
};
CanvasIntInputOption.prototype=Object.create(IntInputOption.prototype);
CanvasIntInputOption.prototype.constructor=CanvasIntInputOption;
CanvasIntInputOption.prototype.availableInputTypes=['constant','slider']; // can't change canvas size by moving mouse over canvas

var DebugOption=function(name,defaultValue){
	Option.call(this,name,[false,true],defaultValue);
};
DebugOption.prototype=Object.create(Option.prototype);
DebugOption.prototype.constructor=DebugOption;

var OptionsBlueprint=function(){
	this.reset();
};
OptionsBlueprint.prototype.generalOptions=[
	new Option('background',['none','solid']),
	new Option('shader',['single','vertex','face','light']),
	new Option('shape',['square','triangle','gasket','cube','hat','terrain']),
	new Option('elements',['0','8','16','32']),
	new Option('projection',['ortho','perspective']),
];
OptionsBlueprint.prototype.inputOptions=[
	new CanvasIntInputOption('canvas.width',[1,1024],512),
	new CanvasIntInputOption('canvas.height',[1,1024],512),
	new FloatInputOption('background.solid.color.r',[0,1],1),
	new FloatInputOption('background.solid.color.g',[0,1],1),
	new FloatInputOption('background.solid.color.b',[0,1],1),
	new FloatInputOption('background.solid.color.a',[0,1],1),
	new FloatInputOption('shader.single.color.r',[0,1],1),
	new FloatInputOption('shader.single.color.g',[0,1]),
	new FloatInputOption('shader.single.color.b',[0,1]),
	new FloatInputOption('shader.single.color.a',[0,1],1),
	new IntInputOption('shape.lodShape.lod',[0,10],6),
];
OptionsBlueprint.prototype.transformOptions=[];
OptionsBlueprint.prototype.transforms=[];
['rotate.x','rotate.y','rotate.z'].forEach(function(name){
	// TODO make default angle/speed something like 0.2*360 when able to add/delete transforms
	var valueOption=new FloatInputOption(name,[-180,180],0);
	var speedOption=new FloatInputOption(name+'.speed',[-360,360],0);
	OptionsBlueprint.prototype.transformOptions.push(valueOption);
	OptionsBlueprint.prototype.transformOptions.push(speedOption);
	OptionsBlueprint.prototype.transforms.push({
		name:name,
		options:[valueOption,speedOption]
	});
});
OptionsBlueprint.prototype.debugOptions=[
	new DebugOption('debugShaders',true),
	new DebugOption('debugArrays'),
	new DebugOption('debugInputs'), // TODO hide if no inputs?
];
OptionsBlueprint.prototype.formattingOptions=[
	new Option('indent',['tab','2','4','8']),
];
OptionsBlueprint.prototype.groupNames=['generalOptions','inputOptions','transformOptions','debugOptions','formattingOptions'];
OptionsBlueprint.prototype.reset=function(){
	this.groupNames.forEach(function(groupName){
		this[groupName].forEach(function(option){
			this[option.name]=option.defaultValue;
			if (groupName=='inputOptions' || groupName=='transformOptions') {
				this[option.name+'.input']='constant';
			}
		},this);
	},this);
	this.transformOrder=this.transforms.map(function(transform){
		return transform.name;
	});
};
OptionsBlueprint.prototype.fix=function(){
	return new OptionsInstance(this);
};

var OptionsInstance=function(blueprint){
	blueprint.groupNames.forEach(function(groupName){
		this[groupName]=[];
		blueprint[groupName].forEach(function(option){
			var isHidden=blueprint.generalOptions.some(function(generalOption){
				return generalOption.doesValueHideOption(blueprint[generalOption.name],option);
			});
			if (!isHidden) {
				this[groupName].push(option);
				this[option.name]=blueprint[option.name];
				if (groupName=='inputOptions' || groupName=='transformOptions') {
					this[option.name+'.input']=blueprint[option.name+'.input'];
				}
			}
		},this);
	},this);
	this.transformOrder=blueprint.transformOrder;
};
OptionsInstance.prototype.getInputOptionsFor=function(prefix){
	return this.inputOptions.filter(function(option){
		return option.name.indexOf(prefix+'.')===0;
	},this);
};
OptionsInstance.prototype.getInputsFor=function(prefix){
	return this.inputOptions.filter(function(option){
		return option.name.indexOf(prefix+'.')===0 && this[option.name+'.input']!='constant';
	},this);
};
OptionsInstance.prototype.getOnlyInputFor=function(prefix){
	var matchedOptions=this.getInputsFor(prefix);
	if (matchedOptions.length==1) {
		return matchedOptions[0];
	} else {
		return null;
	}
};
OptionsInstance.prototype.hasInputs=function(){
	return this.inputOptions.some(function(option){
		return this[option.name+'.input']!='constant';
	},this) || this.transformOptions.some(function(option){
		return this[option.name+'.input']!='constant';
	},this);
};
OptionsInstance.prototype.hasSliderInputs=function(){
	return this.inputOptions.some(function(option){
		return this[option.name+'.input']=='slider';
	},this) || this.transformOptions.some(function(option){
		return this[option.name+'.input']=='slider';
	},this);
};
OptionsInstance.prototype.hasInputsFor=function(prefix){
	return this.getInputsFor(prefix).length>0;
};
OptionsInstance.prototype.hasAllSliderInputsFor=function(prefix){
	return this.getInputOptionsFor(prefix).every(function(option){
		return this[option.name+'.input']=='slider';
	},this);
};
OptionsInstance.prototype.isAnimated=function(){
	function endsWith(name,suffix) {
		return name.indexOf(suffix,name.length-suffix.length)!==-1;
	};
	return this.transformOptions.some(function(option){
		return endsWith(option.name,'.speed') && (this[option.name]!=0 || this[option.name+'.input']!='constant');
	},this);
};
OptionsInstance.prototype.needsUniform=function(prefix){
	return (
		this[prefix+'.input']!='constant' ||
		this[prefix+'.speed']!=0 || this[prefix+'.speed.input']!='constant'
	);
};
OptionsInstance.prototype.needsTransform=function(prefix){
	return this.needsUniform(prefix) || this[prefix]!=0;
};

module.exports=OptionsBlueprint;
