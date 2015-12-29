// obsolete code TODO remove

var Option=function(name,availableValues,defaultValue,visibilityData){
	this.name=name;
	this.availableValues=availableValues; // for range its [min,max,step]
	if (defaultValue===undefined) {
		this.defaultValue=availableValues[0];
	} else {
		this.defaultValue=defaultValue;
	}
	if (visibilityData===undefined) {
		this.visibilityData={};
	} else {
		this.visibilityData=visibilityData;
	}
};
Option.prototype.isVisible=function(options){
	for (var testName in this.visibilityData) {
		if (this.visibilityData[testName].indexOf(options[testName])<0) {
			return false;
		}
	}
	return true;
};
Option.prototype.isVisibilityAffectedBy=function(changedOption){
	return this.visibilityData[changedOption.name]!==undefined;
};
Option.prototype.reset=function(options){
	options[this.name]=this.defaultValue;
};
Option.prototype.copy=function(dstOptions,srcOptions){
	dstOptions[this.name]=srcOptions[this.name];
};

var InputOption=function(name,rangeOfValues,defaultValue,visibilityData){
	Option.apply(this,arguments);
};
InputOption.prototype=Object.create(Option.prototype);
InputOption.prototype.constructor=InputOption;
InputOption.prototype.availableInputTypes=['constant','slider','mousemovex','mousemovey',];
InputOption.prototype.availableGamepadInputTypes=['gamepad0','gamepad1','gamepad2','gamepad3'];
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
InputOption.prototype.needRange=function(options){ // range for value; speed always needs range
	return false;
};
InputOption.prototype.needSpeed=function(options){
	return false;
};
InputOption.prototype.reset=function(options){
	Option.prototype.reset.call(this,options);
	options[this.name+'.input']='constant';
	options[this.name+'.min']=this.getMin();
	options[this.name+'.max']=this.getMax();
	options[this.name+'.speed']=0;
	options[this.name+'.speed.input']='constant';
	options[this.name+'.speed.min']=this.getMinSpeed();
	options[this.name+'.speed.max']=this.getMaxSpeed();
};
InputOption.prototype.copy=function(dstOptions,srcOptions){
	Option.prototype.copy.call(this,dstOptions,srcOptions);
	dstOptions[this.name+'.min']=srcOptions[this.name+'.input']=='constant'?this.getMin():srcOptions[this.name+'.min'];
	dstOptions[this.name+'.max']=srcOptions[this.name+'.input']=='constant'?this.getMin():srcOptions[this.name+'.max'];
};

var FloatInputOption=function(name,rangeOfValues,defaultValue,visibilityData){
	InputOption.apply(this,arguments);
};
FloatInputOption.prototype=Object.create(InputOption.prototype);
FloatInputOption.prototype.constructor=FloatInputOption;
FloatInputOption.prototype.availableInputTypes=InputOption.prototype.availableInputTypes.concat(InputOption.prototype.availableGamepadInputTypes);
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
FloatInputOption.prototype.needSpeed=function(options){
	return false;
};
FloatInputOption.prototype.reset=function(options){
	InputOption.prototype.reset.call(this,options);
	options[this.name+'.speed']=0;
	options[this.name+'.speed.input']='constant';
	options[this.name+'.speed.min']=this.getMin()*2;
	options[this.name+'.speed.max']=this.getMax()*2;
};

var IntInputOption=function(name,rangeOfValues,defaultValue,visibilityData){
	InputOption.apply(this,arguments);
};
IntInputOption.prototype=Object.create(InputOption.prototype);
IntInputOption.prototype.constructor=IntInputOption;
IntInputOption.prototype.getStep=function(){
	return 1;
};
IntInputOption.prototype.getSetupStep=function(){
	return 1;
};

var CanvasIntInputOption=function(name,rangeOfValues,defaultValue,visibilityData){
	IntInputOption.apply(this,arguments);
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
	new Option('materialScope',['global','vertex','face']),
	new Option('materialData',['one','sda']),
	new Option('shape',['square','triangle','gasket','cube','hat','terrain']),
	new Option('elements',['0','8','16','32']),
	new Option('light',['off','phong','blinn']),
	//new Option('lightData',['none','one','sda'],'sda',{light:['on']}),
	new Option('projection',['ortho','perspective']),
];
OptionsBlueprint.prototype.inputOptions=[
	new CanvasIntInputOption('canvas.width',[1,1024],512),
	new CanvasIntInputOption('canvas.height',[1,1024],512),
	new FloatInputOption('backgroundColor.r',[0,1],1,{background:['solid']}),
	new FloatInputOption('backgroundColor.g',[0,1],1,{background:['solid']}),
	new FloatInputOption('backgroundColor.b',[0,1],1,{background:['solid']}),
	new FloatInputOption('backgroundColor.a',[0,1],1,{background:['solid']}),
	new FloatInputOption('materialColor.r',[0,1],1,{materialScope:['global'],materialData:['one']}),
	new FloatInputOption('materialColor.g',[0,1],0,{materialScope:['global'],materialData:['one']}),
	new FloatInputOption('materialColor.b',[0,1],0,{materialScope:['global'],materialData:['one']}),
	new FloatInputOption('materialColor.a',[0,1],1,{materialScope:['global'],materialData:['one']}),
	new FloatInputOption('materialSpecularColor.r',[0,1],0.4,{materialScope:['global'],materialData:['sda']}),
	new FloatInputOption('materialSpecularColor.g',[0,1],0.4,{materialScope:['global'],materialData:['sda']}),
	new FloatInputOption('materialSpecularColor.b',[0,1],0.4,{materialScope:['global'],materialData:['sda']}),
	new FloatInputOption('materialDiffuseColor.r' ,[0,1],0.4,{materialScope:['global'],materialData:['sda']}),
	new FloatInputOption('materialDiffuseColor.g' ,[0,1],0.4,{materialScope:['global'],materialData:['sda']}),
	new FloatInputOption('materialDiffuseColor.b' ,[0,1],0.4,{materialScope:['global'],materialData:['sda']}),
	new FloatInputOption('materialAmbientColor.r' ,[0,1],0.2,{materialScope:['global'],materialData:['sda']}),
	new FloatInputOption('materialAmbientColor.g' ,[0,1],0.2,{materialScope:['global'],materialData:['sda']}),
	new FloatInputOption('materialAmbientColor.b' ,[0,1],0.2,{materialScope:['global'],materialData:['sda']}),
	new FloatInputOption('lightDirection.x',[-4,+4],-1,{light:['phong','blinn']}),
	new FloatInputOption('lightDirection.y',[-4,+4],+1,{light:['phong','blinn']}),
	new FloatInputOption('lightDirection.z',[-4,+4],+1,{light:['phong','blinn']}),
	new IntInputOption('shapeLod',[0,10],6,{shape:['gasket','hat','terrain']}),
];
OptionsBlueprint.prototype.transformOptions=['rotate.x','rotate.y','rotate.z'].map(function(name){
	return new FloatInputOption(name,[-180,180],0);
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
			option.reset(this);
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
			if (option.isVisible(blueprint)) {
				this[groupName].push(option);
				option.copy(this,blueprint);
			}
		},this);
		//blueprint.transforms.forEach(function(transform){
		//	if (InputOption.prototype.availableGamepadInputTypes.indexOf(this[transform.name+'.input'])>=0) {
		//		this[transform.name+'.speed']=0;
		//		this[transform.name+'.speed.input']='constant';
		//	}
		//},this);
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
OptionsInstance.prototype.hasGamepadInputs=function(){
	return this.inputOptions.some(function(option){
		return option.availableGamepadInputTypes.indexOf(this[option.name+'.input'])>=0;
	},this) || this.transformOptions.some(function(option){
		return option.availableGamepadInputTypes.indexOf(this[option.name+'.input'])>=0;
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
		return (option instanceof InputOption) && (
			(endsWith(option.name,'.speed') && (this[option.name]!=0 || this[option.name+'.input']!='constant')) || // has input with nonzero speed
			(option.availableGamepadInputTypes.indexOf(this[option.name+'.input'])>=0) // has gamepad input which needs to be polled
		);
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
