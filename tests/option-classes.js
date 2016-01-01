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
		const options=new TestOptions({lod:4});
		const option=options.root.entries[0];
		assert.equal(option.value,4);
		assert.equal(option.min,0);
		assert.equal(option.max,10);
		assert.equal(option.input,'constant');
	});
	it("imports object with value",()=>{
		const options=new TestOptions({lod:{value:3}});
		const option=options.root.entries[0];
		assert.equal(option.value,3);
		assert.equal(option.min,0);
		assert.equal(option.max,10);
		assert.equal(option.input,'constant');
	});
	it("imports object with min",()=>{
		const options=new TestOptions({lod:{min:2}});
		const option=options.root.entries[0];
		assert.equal(option.value,6);
		assert.equal(option.min,2);
		assert.equal(option.max,10);
		assert.equal(option.input,'constant');
	});
	it("imports object with value, min, max and input",()=>{
		const options=new TestOptions({lod:{value:7,min:3,max:9,input:'slider'}});
		const option=options.root.entries[0];
		assert.equal(option.value,7);
		assert.equal(option.min,3);
		assert.equal(option.max,9);
		assert.equal(option.input,'slider');
	});
});
