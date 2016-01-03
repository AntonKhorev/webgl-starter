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
	it("exports nothing",()=>{
		const options=new TestOptions;
		assert.deepEqual(options.export(),{});
	});
	it("exports number",()=>{
		const options=new TestOptions;
		const option=options.root.entries[0];
		option.value=4;
		assert.deepEqual(options.export(),{lod:
			4
		});
	});
	it("exports object with min",()=>{
		const options=new TestOptions;
		const option=options.root.entries[0];
		option.min=2;
		assert.deepEqual(options.export(),{lod:
			{min:2}
		});
	});
	it("exports object with value, min, max and input",()=>{
		const options=new TestOptions;
		const option=options.root.entries[0];
		option.value=7;
		option.min=3;
		option.max=9;
		option.input='slider';
		assert.deepEqual(options.export(),{lod:
			{value:7,min:3,max:9,input:'slider'}
		});
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

describe("Option.LiveColor",()=>{
	class TestOptions extends Options {
		get optionClasses() {
			return Option;
		}
		get entriesDescription() {
			return [
				['LiveColor','color',[1,0,0]],
			];
		}
	}
	it("inits",()=>{
		const options=new TestOptions;
		const option=options.root.entries[0];
		assert.equal(option.entries.length,3);
		const r=option.entries[0];
		assert.equal(r.value,1);
		assert.equal(r.speed.value,0);
		const g=option.entries[1];
		assert.equal(g.value,0);
		assert.equal(g.speed.value,0);
		const b=option.entries[2];
		assert.equal(g.value,0);
		assert.equal(g.speed.value,0);
	});
	it("imports numbers",()=>{
		const options=new TestOptions({color:{
			r:0.2,
			b:0.4,
		}});
		const option=options.root.entries[0];
		assert.equal(option.entries.length,3);
		const r=option.entries[0];
		assert.equal(r.value,0.2);
		assert.equal(r.speed.value,0);
		const g=option.entries[1];
		assert.equal(g.value,0);
		assert.equal(g.speed.value,0);
		const b=option.entries[2];
		assert.equal(b.value,0.4);
		assert.equal(b.speed.value,0);
	});
	it("imports objects",()=>{
		const options=new TestOptions({color:{
			g:{
				value:0.3,
				speed:-0.1,
			},
			b:{
				value:0.7,
			},
		}});
		const option=options.root.entries[0];
		assert.equal(option.entries.length,3);
		const r=option.entries[0];
		assert.equal(r.value,1);
		assert.equal(r.speed.value,0);
		const g=option.entries[1];
		assert.equal(g.value,0.3);
		assert.equal(g.speed.value,-0.1);
		const b=option.entries[2];
		assert.equal(b.value,0.7);
		assert.equal(b.speed.value,0);
	});
});
