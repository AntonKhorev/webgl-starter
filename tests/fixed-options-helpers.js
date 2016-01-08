'use strict';

const assert=require('assert');
const Options=require('../src/options.js');
const fixOptHelp=require('../src/fixed-options-helpers.js');

describe("fixOptHelp.extendCollection",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['LiveColor','color',[0.2,0.2,0.2]],
			];
		}
	}
	it("extends color",()=>{
		const options=new TestOptions();
		const fog=options.fix().color;
		const efog=fixOptHelp.extendCollection(fog,Options,[
			['LiveFloat','a',[0,1],1],
		]);
		assert.equal(efog.r,0.2);
		assert.equal(efog.a,1.0);
		assert.deepEqual(efog.map((v,c,i)=>[Number(v),c,i]),[
			[0.2,'r',0],
			[0.2,'g',1],
			[0.2,'b',2],
			[1.0,'a',3],
		]);
	});
});

describe("fixOptHelp.formatNumber",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['CanvasLiveInt','width',[1,1024],512],
			];
		}
	}
	it("formats unsigned int",()=>{
		const options=new TestOptions();
		const n=options.fix().width;
		assert.equal(fixOptHelp.formatNumber(n),512);
	});
});
