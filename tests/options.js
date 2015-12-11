var assert=require('assert');
var Options=require('../src/options.js');

describe('Options',function(){
	it('passes speed when value input type is not a gamepad',function(){
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
	it('resets speed when value input type is a gamepad',function(){
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
});
