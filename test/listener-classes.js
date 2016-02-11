'use strict';

const assert=require('assert');
const Input=require('../src/input-classes.js');
const Listener=require('../src/listener-classes.js');

describe("Listener.Slider",()=>{
	it("is empty",()=>{
		const listener=new Listener.Slider('mySlider');
		const entry=listener.enter();
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[]);
	});
	it("supports chained calls to entry",()=>{
		const listener=new Listener.Slider('mySlider');
		listener.enter()
			.pre("preAction();")
			.post("postAction();");
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"document.getElementById('mySlider').addEventListener('change',function(){",
			"	preAction();",
			"	postAction();",
			"});",
		]);
	});
});

describe("Listener.MultipleSlider",()=>{
	it("is doubly-indented inside",()=>{
		const listener=new Listener.MultipleSlider('.mySliders');
		listener.enter()
			.post("postAction();");
		const lines=listener.write(true,false);
		assert.deepEqual(lines.data,[
			"[].forEach.call(document.querySelectorAll('.mySliders'),function(el){",
			"	el.addEventListener('change',function(){",
			"		postAction();",
			"		scheduleFrame();",
			"	});",
			"});",
		]);
	});
	it("does not create anon fn when its body consists only of one fn call",()=>{
		const listener=new Listener.MultipleSlider('.mySliders');
		listener.enter()
			.post("postAction();");
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"[].forEach.call(document.querySelectorAll('.mySliders'),function(el){",
			"	el.addEventListener('change',postAction);",
			"});",
		]);
	});
});

describe("Listener.CanvasMousemove",()=>{
	it("is empty",()=>{
		const listener=new Listener.CanvasMousemove();
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[]);
	});
	it("should only have preAction()",()=>{
		const listener=new Listener.CanvasMousemove();
		const entry=listener.enter();
		entry.pre("preAction();");
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	preAction();",
			"});",
		]);
	});
	it("should call scheduleFrame() once if two entries are given",()=>{
		const listener=new Listener.CanvasMousemove();
		const entry1=listener.enter();
		const entry2=listener.enter();
		const lines=listener.write(true,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	scheduleFrame();",
			"});",
		]);
	});
	it("should call updateColor() once if two entries are given",()=>{
		const listener=new Listener.CanvasMousemove();
		const entry1=listener.enter();
		entry1.post(
			"updateColor();"
		);
		const entry2=listener.enter();
		entry2.post(
			"updateColor();"
		);
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	updateColor();",
			"});",
		]);
	});
	it("should have preActions before postAction",()=>{
		const listener=new Listener.CanvasMousemove();
		const entry1=listener.enter();
		entry1.pre("preAction1();");
		entry1.post("postAction();");
		const entry2=listener.enter();
		entry2.pre("preAction2();");
		entry2.post("postAction();");
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	preAction1();",
			"	preAction2();",
			"	postAction();",
			"});",
		]);
	});
	it("outputs code to get float value with x-axis, min/max declaration, no value declaration",()=>{
		const listener=new Listener.CanvasMousemove();
		listener.enter()
			.minMaxFloat(Input.createFromString('mousemovex'),'foo','-180','+180');
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	var minFoo=-180;",
			"	var maxFoo=+180;",
			"	foo=minFoo+(maxFoo-minFoo)*(ev.clientX-rect.left)/(rect.width-1);",
			"});",
		]);
	});
	it("outputs code to get [0..1] value with x-axis, min/max declaration omitted b/c not needed, no value declaration",()=>{
		const listener=new Listener.CanvasMousemove();
		listener.enter()
			.minMaxFloat(Input.createFromString('mousemovex'),'baz',0,1);
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	baz=(ev.clientX-rect.left)/(rect.width-1);",
			"});",
		]);
	});
	it("outputs code to get float value with y-axis, min/max declaration, value declaration",()=>{
		const listener=new Listener.CanvasMousemove();
		listener.enter()
			.minMaxVarFloat(Input.createFromString('mousemovey'),'bar','-100','+100');
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	var minBar=-100;",
			"	var maxBar=+100;",
			"	var bar=minBar+(maxBar-minBar)*(rect.bottom-1-ev.clientY)/(rect.height-1);",
			"});",
		]);
	});
	it("outputs code to get int value with y-axis, new value declaration",()=>{
		const listener=new Listener.CanvasMousemove();
		listener.enter()
			.newVarInt(Input.createFromString('mousemovey'),'depth');
		const lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	var newDepth=Math.floor(minDepth+(maxDepth-minDepth+1)*(rect.bottom-1-ev.clientY)/rect.height);",
			"});",
		]);
	});
});
