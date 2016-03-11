'use strict'

const assert=require('assert')
const Input=require('../src/input-classes')
const Option=require('../src/option-classes')
const Options=require('crnx-base/options')

describe("Option.LiveInt",()=>{
	class TestOptions extends Options {
		get optionClasses() {
			return Option
		}
		get entriesDescription() {
			return [
				['LiveInt','lod',[0,10],6],
			]
		}
	}
	it("inits",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		assert.equal(option.value,6)
		assert.equal(option.min,0)
		assert.equal(option.max,10)
		assert.equal(option.input,'constant')
	})
	it("imports number",()=>{
		const options=new TestOptions({lod:
			4
		})
		const option=options.root.entries[0]
		assert.equal(option.value,4)
		assert.equal(option.min,0)
		assert.equal(option.max,10)
		assert.equal(option.input,'constant')
	})
	it("imports object with value",()=>{
		const options=new TestOptions({lod:
			{value:3}
		})
		const option=options.root.entries[0]
		assert.equal(option.value,3)
		assert.equal(option.min,0)
		assert.equal(option.max,10)
		assert.equal(option.input,'constant')
	})
	it("imports object with min",()=>{
		const options=new TestOptions({lod:
			{min:2}
		})
		const option=options.root.entries[0]
		assert.equal(option.value,6)
		assert.equal(option.min,2)
		assert.equal(option.max,10)
		assert.equal(option.input,'constant')
	})
	it("imports object with value, min, max and input",()=>{
		const options=new TestOptions({lod:
			{value:7,min:3,max:9,input:'slider'}
		})
		const option=options.root.entries[0]
		assert.equal(option.value,7)
		assert.equal(option.min,3)
		assert.equal(option.max,9)
		assert.equal(option.input,'slider')
	})
	it("exports nothing",()=>{
		const options=new TestOptions
		assert.deepEqual(options.export(),{})
	})
	it("exports number",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=4
		assert.deepEqual(options.export(),{lod:
			4
		})
	})
	it("exports object with min",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.min=2
		assert.deepEqual(options.export(),{lod:
			{min:2}
		})
	})
	it("exports object with value, min, max and input",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=7
		option.min=3
		option.max=9
		option.input='slider'
		assert.deepEqual(options.export(),{lod:
			{value:7,min:3,max:9,input:'slider'}
		})
	})
	it("fixes data",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=7
		option.max=9
		option.input='slider'
		const fixed=options.fix()
		assert.equal(fixed.lod,7)
		assert.equal(fixed.lod.value,7)
		assert.equal(fixed.lod.name,'lod')
		assert.equal(fixed.lod.min,0)
		assert.equal(fixed.lod.max,9)
		assert.equal(fixed.lod.input,'slider')
		assert.equal(fixed.lod.availableMin,0)
		assert.equal(fixed.lod.availableMax,10)
		assert.equal(fixed.lod.precision,0)
	})
	it("has Slider input class",()=>{
		const options=new TestOptions({lod:
			{input:'slider'}
		})
		const fixed=options.fix()
		assert(fixed.lod.input instanceof Input.Slider)
	})
})

describe("Option.LiveFloat",()=>{
	class TestOptions extends Options {
		get optionClasses() {
			return Option
		}
		get entriesDescription() {
			return [
				['LiveFloat','rotate',[-180,+180,-360,+360],0],
			]
		}
	}
	it("inits",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		assert.equal(option.value,0)
		assert.equal(option.min,-180)
		assert.equal(option.max,+180)
		assert.equal(option.input,'constant')
		assert.equal(option.speed.value,0)
		assert.equal(option.speed.min,-360)
		assert.equal(option.speed.max,+360)
		assert.equal(option.speed.input,'constant')
		assert.equal(option.addSpeed,false)
	})
	it("imports number",()=>{
		const options=new TestOptions({rotate:
			90
		})
		const option=options.root.entries[0]
		assert.equal(option.value,90)
		assert.equal(option.min,-180)
		assert.equal(option.max,+180)
		assert.equal(option.input,'constant')
		assert.equal(option.speed.value,0)
		assert.equal(option.speed.min,-360)
		assert.equal(option.speed.max,+360)
		assert.equal(option.speed.input,'constant')
		assert.equal(option.addSpeed,false)
	})
	it("imports object with speed number",()=>{
		const options=new TestOptions({rotate:
			{speed:45}
		})
		const option=options.root.entries[0]
		assert.equal(option.value,0)
		assert.equal(option.min,-180)
		assert.equal(option.max,+180)
		assert.equal(option.input,'constant')
		assert.equal(option.speed.value,45)
		assert.equal(option.speed.min,-360)
		assert.equal(option.speed.max,+360)
		assert.equal(option.speed.input,'constant')
		assert.equal(option.addSpeed,true)
	})
	it("imports object with speed number equal to default",()=>{
		const options=new TestOptions({rotate:
			{speed:0}
		})
		const option=options.root.entries[0]
		assert.equal(option.value,0)
		assert.equal(option.min,-180)
		assert.equal(option.max,+180)
		assert.equal(option.input,'constant')
		assert.equal(option.speed.value,0)
		assert.equal(option.speed.min,-360)
		assert.equal(option.speed.max,+360)
		assert.equal(option.speed.input,'constant')
		assert.equal(option.addSpeed,false)
	})
	it("imports object with value and speed number",()=>{
		const options=new TestOptions({rotate:
			{value:12,speed:45}
		})
		const option=options.root.entries[0]
		assert.equal(option.value,12)
		assert.equal(option.min,-180)
		assert.equal(option.max,+180)
		assert.equal(option.input,'constant')
		assert.equal(option.speed.value,45)
		assert.equal(option.speed.min,-360)
		assert.equal(option.speed.max,+360)
		assert.equal(option.speed.input,'constant')
		assert.equal(option.addSpeed,true)
	})
	it("imports object with speed object with input",()=>{
		const options=new TestOptions({rotate:
			{speed:{
				input:'slider',
			}}
		})
		const option=options.root.entries[0]
		assert.equal(option.value,0)
		assert.equal(option.min,-180)
		assert.equal(option.max,+180)
		assert.equal(option.input,'constant')
		assert.equal(option.speed.value,0)
		assert.equal(option.speed.min,-360)
		assert.equal(option.speed.max,+360)
		assert.equal(option.speed.input,'slider')
		assert.equal(option.addSpeed,true)
	})
	it("imports object with speed object with everything",()=>{
		const options=new TestOptions({rotate:
			{speed:{
				value:30,
				min:-100,
				max:+100,
				input:'slider',
			}}
		})
		const option=options.root.entries[0]
		assert.equal(option.value,0)
		assert.equal(option.min,-180)
		assert.equal(option.max,+180)
		assert.equal(option.input,'constant')
		assert.equal(option.speed.value,30)
		assert.equal(option.speed.min,-100)
		assert.equal(option.speed.max,+100)
		assert.equal(option.speed.input,'slider')
		assert.equal(option.addSpeed,true)
	})
	it("exports nothing",()=>{
		const options=new TestOptions
		assert.deepEqual(options.export(),{})
	})
	it("exports number",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=90
		assert.deepEqual(options.export(),{rotate:
			90
		})
	})
	it("exports object with speed number",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.addSpeed=true
		option.speed.value=45
		assert.deepEqual(options.export(),{rotate:
			{speed:45}
		})
	})
	it("exports nothing b/c speed set to default",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.addSpeed=true
		option.speed.value=0
		assert.deepEqual(options.export(),{})
	})
	it("exports object with value and speed number",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=12
		option.addSpeed=true
		option.speed.value=45
		assert.deepEqual(options.export(),{rotate:
			{value:12,speed:45}
		})
	})
	it("exports object with speed object with input",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.addSpeed=true
		option.speed.input='slider'
		assert.deepEqual(options.export(),{rotate:
			{speed:{
				input:'slider',
			}}
		})
	})
	it("exports object with speed object with everything",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.addSpeed=true
		option.speed.value=30
		option.speed.min=-100
		option.speed.max=+100
		option.speed.input='slider'
		assert.deepEqual(options.export(),{rotate:
			{speed:{
				value:30,
				min:-100,
				max:+100,
				input:'slider',
			}}
		})
	})
	it("doesn't export speed when addSpeed is not set",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=42
		option.addSpeed=true
		option.speed.value=23
		option.addSpeed=false
		assert.deepEqual(options.export(),{rotate:
			42
		})
	})
	it("doesn't export speed when input is gamepad",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=42
		option.addSpeed=true
		option.speed.value=23
		option.input='gamepad0'
		assert.deepEqual(options.export(),{rotate:
			{value:42, input:'gamepad0'}
		})
	})
	it("fixes data",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=40
		option.addSpeed=true
		option.speed.value=30
		option.speed.min=-100
		option.speed.max=+100
		const fixed=options.fix()
		assert.equal(fixed.rotate,40)
		assert.equal(fixed.rotate.value,40)
		assert.equal(fixed.rotate.name,'rotate')
		assert.equal(fixed.rotate.min,-180)
		assert.equal(fixed.rotate.max,+180)
		assert.equal(fixed.rotate.input,'constant')
		assert.equal(fixed.rotate.availableMin,-180)
		assert.equal(fixed.rotate.availableMax,+180)
		assert.equal(fixed.rotate.precision,1)
		assert.equal(fixed.rotate.speed,30)
		assert.equal(fixed.rotate.speed.value,30)
		assert.equal(fixed.rotate.speed.min,-100)
		assert.equal(fixed.rotate.speed.max,+100)
		assert.equal(fixed.rotate.speed.input,'constant')
		assert.equal(fixed.rotate.speed.availableMin,-360)
		assert.equal(fixed.rotate.speed.availableMax,+360)
		assert.equal(fixed.rotate.speed.precision,1)
	})
	it("doesn't fix speed when addSpeed is not set",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=42
		option.addSpeed=true
		option.speed.value=23
		option.addSpeed=false
		const fixed=options.fix()
		assert.equal(fixed.rotate,42)
		assert.equal(fixed.rotate.speed,0)
	})
	it("doesn't fix speed when input is gamepad",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=42
		option.addSpeed=true
		option.speed.value=23
		option.input='gamepad0'
		const fixed=options.fix()
		assert.equal(fixed.rotate,42)
		assert.equal(fixed.rotate.input,'gamepad0')
		assert.equal(fixed.rotate.speed,0)
	})
})

describe("Option.LiveColor",()=>{
	class TestOptions extends Options {
		get optionClasses() {
			return Option
		}
		get entriesDescription() {
			return [
				['LiveColor','color',[1,0,0]],
			]
		}
	}
	it("inits",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		assert.equal(option.entries.length,3)
		assert.equal(option.fullName,'color')
		const r=option.entries[0]
		assert.equal(r.value,1)
		assert.equal(r.speed.value,0)
		assert.equal(r.addSpeed,false)
		const g=option.entries[1]
		assert.equal(g.value,0)
		assert.equal(g.speed.value,0)
		assert.equal(g.addSpeed,false)
		const b=option.entries[2]
		assert.equal(b.value,0)
		assert.equal(b.speed.value,0)
		assert.equal(b.addSpeed,false)
	})
	it("imports numbers",()=>{
		const options=new TestOptions({color:{
			r:0.2,
			b:0.4,
		}})
		const option=options.root.entries[0]
		assert.equal(option.entries.length,3)
		const r=option.entries[0]
		assert.equal(r.value,0.2)
		assert.equal(r.speed.value,0)
		assert.equal(r.addSpeed,false)
		const g=option.entries[1]
		assert.equal(g.value,0)
		assert.equal(g.speed.value,0)
		assert.equal(g.addSpeed,false)
		const b=option.entries[2]
		assert.equal(b.value,0.4)
		assert.equal(b.speed.value,0)
		assert.equal(b.addSpeed,false)
	})
	it("imports objects",()=>{
		const options=new TestOptions({color:{
			g:{
				value:0.3,
				speed:-0.1,
			},
			b:{
				value:0.7,
			},
		}})
		const option=options.root.entries[0]
		assert.equal(option.entries.length,3)
		const r=option.entries[0]
		assert.equal(r.value,1)
		assert.equal(r.speed.value,0)
		assert.equal(r.addSpeed,false)
		const g=option.entries[1]
		assert.equal(g.value,0.3)
		assert.equal(g.speed.value,-0.1)
		assert.equal(g.addSpeed,true)
		const b=option.entries[2]
		assert.equal(b.value,0.7)
		assert.equal(b.speed.value,0)
		assert.equal(b.addSpeed,false)
	})
	it("exports numbers",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		const r=option.entries[0]
		r.value=0.2
		const b=option.entries[2]
		b.value=0.4
		assert.deepEqual(options.export(),{color:{
			r:0.2,
			b:0.4,
		}})
	})
	it("exports objects",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		const g=option.entries[1]
		g.value=0.3
		g.addSpeed=true
		g.speed.value=-0.1
		const b=option.entries[2]
		b.value=0.7
		b.addSpeed=true
		b.speed.input='slider'
		assert.deepEqual(options.export(),{color:{
			g:{
				value:0.3,
				speed:-0.1,
			},
			b:{
				value:0.7,
				speed:{
					input:'slider',
				},
			},
		}})
	})
	it("fixes data",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		const g=option.entries[1]
		g.value=0.3
		g.addSpeed=true
		g.speed.value=-0.1
		const b=option.entries[2]
		b.value=0.7
		b.addSpeed=true
		b.speed.input='slider'
		const fixed=options.fix()
		assert.equal(fixed.color.r,1.0)
		assert.equal(fixed.color.r.value,1.0)
		assert.equal(fixed.color.r.name,'r')
		assert.equal(fixed.color.r.min,0.0)
		assert.equal(fixed.color.r.max,1.0)
		assert.equal(fixed.color.r.input,'constant')
		assert.equal(fixed.color.r.speed,0.0)
		assert.equal(fixed.color.r.speed.min,-1.0)
		assert.equal(fixed.color.r.speed.max,+1.0)
		assert.equal(fixed.color.r.speed.input,'constant')
		assert.equal(fixed.color.g,0.3)
		assert.equal(fixed.color.g.value,0.3)
		assert.equal(fixed.color.g.name,'g')
		assert.equal(fixed.color.g.min,0.0)
		assert.equal(fixed.color.g.max,1.0)
		assert.equal(fixed.color.g.input,'constant')
		assert.equal(fixed.color.g.speed,-0.1)
		assert.equal(fixed.color.g.speed.min,-1.0)
		assert.equal(fixed.color.g.speed.max,+1.0)
		assert.equal(fixed.color.g.speed.input,'constant')
		assert.equal(fixed.color.b,0.7)
		assert.equal(fixed.color.b.value,0.7)
		assert.equal(fixed.color.b.name,'b')
		assert.equal(fixed.color.b.min,0.0)
		assert.equal(fixed.color.b.max,1.0)
		assert.equal(fixed.color.b.input,'constant')
		assert.equal(fixed.color.b.speed,0.0)
		assert.equal(fixed.color.b.speed.min,-1.0)
		assert.equal(fixed.color.b.speed.max,+1.0)
		assert.equal(fixed.color.b.speed.input,'slider')
		assert.equal(fixed.color.entries.length,3)
		assert.equal(fixed.color.entries[0].name,'r')
		assert.equal(fixed.color.entries[1].name,'g')
		assert.equal(fixed.color.entries[2].name,'b')
	})
})
