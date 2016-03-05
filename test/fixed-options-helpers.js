'use strict'

const assert=require('assert')
const Options=require('../src/options')
const fixOptHelp=require('../src/fixed-options-helpers')

describe("fixOptHelp.formatNumber",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['CanvasLiveInt','width',[1,1024],512],
				['LiveColor','color',[1.0,1.0,1.0,1.0]],
				['LiveFloat','x',[-4.0,+4.0,-4.0,+4.0],+1.0],
				['LiveFloat','rotateX',[-180,+180,-360,+360],0],
			]
		}
	}
	it("formats unsigned int ( xxx)",()=>{
		const options=new TestOptions()
		const n=options.fix().width
		assert.equal(fixOptHelp.formatNumber(n),' 512')
	})
	it("formats unsigned float (x.xxx)",()=>{
		const options=new TestOptions({
			color:{r:0.12341},
		})
		const n=options.fix().color.r
		assert.equal(fixOptHelp.formatNumber(n),'0.123')
	})
	it("formats positive signed float (+x.xxx)",()=>{
		const options=new TestOptions({
			x:+0.12341,
		})
		const n=options.fix().x
		assert.equal(fixOptHelp.formatNumber(n),'+0.123')
	})
	it("formats negative signed float (-x.xxx)",()=>{
		const options=new TestOptions({
			x:-0.12341,
		})
		const n=options.fix().x
		assert.equal(fixOptHelp.formatNumber(n),'-0.123')
	})
	it("formats zero signed float ( x.xxx)",()=>{
		const options=new TestOptions({
			x:0,
		})
		const n=options.fix().x
		assert.equal(fixOptHelp.formatNumber(n),' 0.000')
	})
	it("formats positive signed float (+xxx.x)",()=>{
		const options=new TestOptions({
			rotateX:+123.41,
		})
		const n=options.fix().rotateX
		assert.equal(fixOptHelp.formatNumber(n),'+123.4')
	})
	it("formats positive signed float (+ xx.x)",()=>{
		const options=new TestOptions({
			rotateX:+23.41,
		})
		const n=options.fix().rotateX
		assert.equal(fixOptHelp.formatNumber(n),'+ 23.4')
	})
	it("formats negative signed float (-xxx.x)",()=>{
		const options=new TestOptions({
			rotateX:-123.41,
		})
		const n=options.fix().rotateX
		assert.equal(fixOptHelp.formatNumber(n),'-123.4')
	})
	it("formats zero signed float (   x.x)",()=>{
		const options=new TestOptions({
			rotateX:0,
		})
		const n=options.fix().rotateX
		assert.equal(fixOptHelp.formatNumber(n),'   0.0')
	})
})

describe("fixOptHelp.makeFormatNumber",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['CanvasLiveInt','width',[1,1024],512],
			]
		}
	}
	it("makes unsigned int formatter",()=>{
		const options=new TestOptions()
		const n=options.fix().width
		assert.equal(fixOptHelp.makeFormatNumber(n)(418),' 418')
	})
})
