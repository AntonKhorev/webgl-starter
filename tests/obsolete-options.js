var assert=require('assert');
var Options=require('../src/obsolete-options.js');

var VisiCheck=function(){
	this.visible=true;
};
VisiCheck.prototype.toggle=function(visibility){
	if (visibility===true || visibility===false) {
		this.visible=visibility;
	} else {
		throw "visibility value neither true nor false";
	}
};

describe("Visibility test utility",function(){
	it("works",function(){
		var $=new VisiCheck;
		assert($.visible);
		$.toggle(false);
		assert(!$.visible);
		$.toggle(true);
		assert($.visible);
		assert.throws(function(){
			$.toggle();
		});
	});
});

describe("Options",function(){
	// TODO isAnimated no longer returned by options
	/*
	it("isn't animated by default",function(){
		var options=new Options();
		var fixedOptions=options.fix();
		assert.equal(
			fixedOptions.isAnimated(),
			false
		);
	});
	it("is animated when has nonzero speeds",function(){
		var options=new Options();
		options['rotate.x.speed']=10;
		var fixedOptions=options.fix();
		assert.equal(
			fixedOptions.isAnimated(),
			true
		);
	});
	it("is animated when have gamepad inputs",function(){
		var options=new Options();
		options['rotate.y.input']='gamepad2';
		var fixedOptions=options.fix();
		assert.equal(
			fixedOptions.isAnimated(),
			true
		);
	});
	*/
	// TODO interface is likely changed
	/*
	it("has no gamepad inputs by default",function(){
		var options=new Options();
		var fixedOptions=options.fix();
		assert.equal(
			fixedOptions.hasGamepadInputs(),
			false
		);
	});
	it("has gamepad inputs when asked for",function(){
		var options=new Options();
		options['rotate.z.input']='gamepad3';
		var fixedOptions=options.fix();
		assert.equal(
			fixedOptions.hasGamepadInputs(),
			true
		);
	});
	it("passes speed when value input type is not a gamepad",function(){
		var options=new Options();
		options['rotate.x.speed']=100;
		options['rotate.x.speed.input']='slider';
		var fixedOptions=options.fix();
		assert.equal(
			fixedOptions['rotate.x.speed'],
			100
		);
		assert.equal(
			fixedOptions['rotate.x.speed.input'],
			'slider'
		);
	});
	it("resets speed when value input type is a gamepad",function(){
		var options=new Options();
		options['rotate.x.input']='gamepad2';
		options['rotate.x.speed']=100;
		options['rotate.x.speed.input']='slider';
		var fixedOptions=options.fix();
		assert.equal(
			fixedOptions['rotate.x.speed'],
			0
		);
		assert.equal(
			fixedOptions['rotate.x.speed.input'],
			'constant'
		);
	});
	*/
});
