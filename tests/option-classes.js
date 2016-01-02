'use strict';

const assert=require('assert');
const Option=require('../src/option-classes.js');
const Options=require('../src/base/options.js');

describe("Option.LiveInt",()=>{
	class TestOptions extends Options {
		get optionClasses() {
			return Option;
		}
		get entriesDescription() {
			return [
				['LiveInt','lod',[0,10],6],
			];
		}
	}
	it("inits",()=>{
		const options=new TestOptions;
		const option=options.root.entries[0];
		assert.equal(option.value,6);
		assert.equal(option.min,0);
		assert.equal(option.max,10);
		assert.equal(option.input,'constant');
	});
	it("imports number",()=>{
		const options=new TestOptions({lod:
			4
		});
		const option=options.root.entries[0];
		assert.equal(option.value,4);
		assert.equal(option.min,0);
		assert.equal(option.max,10);
		assert.equal(option.input,'constant');
	});
	it("imports object with value",()=>{
		const options=new TestOptions({lod:
			{value:3}
		});
		const option=options.root.entries[0];
		assert.equal(option.value,3);
		assert.equal(option.min,0);
		assert.equal(option.max,10);
		assert.equal(option.input,'constant');
	});
	it("imports object with min",()=>{
		const options=new TestOptions({lod:
			{min:2}
		});
		const option=options.root.entries[0];
		assert.equal(option.value,6);
		assert.equal(option.min,2);
		assert.equal(option.max,10);
		assert.equal(option.input,'constant');
	});
	it("imports object with value, min, max and input",()=>{
		const options=new TestOptions({lod:
			{value:7,min:3,max:9,input:'slider'}
		});
		const option=options.root.entries[0];
		assert.equal(option.value,7);
		assert.equal(option.min,3);
		assert.equal(option.max,9);
		assert.equal(option.input,'slider');
	});
});

describe("Option.LiveFloat",()=>{
	class TestOptions extends Options {
		get optionClasses() {
			return Option;
		}
		get entriesDescription() {
			return [
				['LiveFloat','rotate',[-180,+180,-360,+360],0],
			];
		}
	}
	it("inits",()=>{
		const options=new TestOptions;
		const option=options.root.entries[0];
		assert.equal(option.value,0);
		assert.equal(option.min,-180);
		assert.equal(option.max,+180);
		assert.equal(option.input,'constant');
		assert.equal(option.speed.value,0);
		assert.equal(option.speed.min,-360);
		assert.equal(option.speed.max,+360);
		assert.equal(option.speed.input,'constant');
		assert.equal(option.addSpeed,false);
	});
	it("imports number",()=>{
		const options=new TestOptions({rotate:
			90
		});
		const option=options.root.entries[0];
		assert.equal(option.value,90);
		assert.equal(option.min,-180);
		assert.equal(option.max,+180);
		assert.equal(option.input,'constant');
		assert.equal(option.speed.value,0);
		assert.equal(option.speed.min,-360);
		assert.equal(option.speed.max,+360);
		assert.equal(option.speed.input,'constant');
		assert.equal(option.addSpeed,false);
	});
	it("imports object with speed number",()=>{
		const options=new TestOptions({rotate:
			{speed:45}
		});
		const option=options.root.entries[0];
		assert.equal(option.value,0);
		assert.equal(option.min,-180);
		assert.equal(option.max,+180);
		assert.equal(option.input,'constant');
		assert.equal(option.speed.value,45);
		assert.equal(option.speed.min,-360);
		assert.equal(option.speed.max,+360);
		assert.equal(option.speed.input,'constant');
		assert.equal(option.addSpeed,true);
	});
	it("imports object with speed number equal to default",()=>{
		const options=new TestOptions({rotate:
			{speed:0}
		});
		const option=options.root.entries[0];
		assert.equal(option.value,0);
		assert.equal(option.min,-180);
		assert.equal(option.max,+180);
		assert.equal(option.input,'constant');
		assert.equal(option.speed.value,0);
		assert.equal(option.speed.min,-360);
		assert.equal(option.speed.max,+360);
		assert.equal(option.speed.input,'constant');
		assert.equal(option.addSpeed,false);
	});
	it("imports object with speed object with input",()=>{
		const options=new TestOptions({rotate:
			{speed:{
				input:'slider',
			}}
		});
		const option=options.root.entries[0];
		assert.equal(option.value,0);
		assert.equal(option.min,-180);
		assert.equal(option.max,+180);
		assert.equal(option.input,'constant');
		assert.equal(option.speed.value,0);
		assert.equal(option.speed.min,-360);
		assert.equal(option.speed.max,+360);
		assert.equal(option.speed.input,'slider');
		assert.equal(option.addSpeed,true);
	});
	it("imports object with speed object with everything",()=>{
		const options=new TestOptions({rotate:
			{speed:{
				value:30,
				min:-100,
				max:+100,
				input:'slider',
			}}
		});
		const option=options.root.entries[0];
		assert.equal(option.value,0);
		assert.equal(option.min,-180);
		assert.equal(option.max,+180);
		assert.equal(option.input,'constant');
		assert.equal(option.speed.value,30);
		assert.equal(option.speed.min,-100);
		assert.equal(option.speed.max,+100);
		assert.equal(option.speed.input,'slider');
		assert.equal(option.addSpeed,true);
	});
});
