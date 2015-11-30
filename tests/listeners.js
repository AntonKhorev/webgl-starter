var assert=require('assert');

var listeners=require('../src/listeners.js');

describe('SliderListener',function(){
	it('is empty',function(){
		var listener=new listeners.SliderListener('mySlider');
		var entry=listener.enter();
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[]);
	});
	it('supports chained calls to entry',function(){
		var listener=new listeners.SliderListener('mySlider');
		listener.enter()
			.pre("preAction();")
			.post("postAction();");
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"document.getElementById('mySlider').addEventListener('change',function(){",
			"	preAction();",
			"	postAction();",
			"});",
		]);
	});
});

describe('MultipleSliderListener',function(){
	it('is doubly-indented inside',function(){
		var listener=new listeners.MultipleSliderListener('.mySliders');
		listener.enter()
			.post("postAction();");
		var lines=listener.write(true,false);
		assert.deepEqual(lines.data,[
			"[].forEach.call(document.querySelectorAll('.mySliders'),function(el){",
			"	el.addEventListener('change',function(){",
			"		postAction();",
			"		scheduleFrame();",
			"	});",
			"});",
		]);
	});
	it('does not create anon fn when its body consists only of one fn call',function(){
		var listener=new listeners.MultipleSliderListener('.mySliders');
		listener.enter()
			.post("postAction();");
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"[].forEach.call(document.querySelectorAll('.mySliders'),function(el){",
			"	el.addEventListener('change',postAction);",
			"});",
		]);
	});
});

describe('CanvasMousemoveListener',function(){
	it('is empty',function(){
		var listener=new listeners.CanvasMousemoveListener();
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[]);
	});
	it('should only have preAction()',function(){
		var listener=new listeners.CanvasMousemoveListener();
		var entry=listener.enter();
		entry.pre("preAction();");
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	preAction();",
			"});",
		]);
	});
	it('should call scheduleFrame() once if two entries are given',function(){
		var listener=new listeners.CanvasMousemoveListener();
		var entry1=listener.enter();
		var entry2=listener.enter();
		var lines=listener.write(true,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	scheduleFrame();",
			"});",
		]);
	});
	it('should call updateColor() once if two entries are given',function(){
		var listener=new listeners.CanvasMousemoveListener();
		var entry1=listener.enter();
		entry1.post(
			"updateColor();"
		);
		var entry2=listener.enter();
		entry2.post(
			"updateColor();"
		);
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	updateColor();",
			"});",
		]);
	});
	it('should have preActions before postAction',function(){
		var listener=new listeners.CanvasMousemoveListener();
		var entry1=listener.enter();
		entry1.pre("preAction1();");
		entry1.post("postAction();");
		var entry2=listener.enter();
		entry2.pre("preAction2();");
		entry2.post("postAction();");
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	preAction1();",
			"	preAction2();",
			"	postAction();",
			"});",
		]);
	});
	it('outputs code to get float value with x-axis, min/max declaration, no value declaration',function(){
		var listener=new listeners.CanvasMousemoveListener();
		listener.enter()
			.minMaxFloat('mousemovex','foo','-180','+180');
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	var minFoo=-180;",
			"	var maxFoo=+180;",
			"	foo=minFoo+(maxFoo-minFoo)*(ev.clientX-rect.left)/(rect.width-1);",
			"});",
		]);
	});
	it('outputs code to get [0..1] value with x-axis, min/max declaration omitted b/c not needed, no value declaration',function(){
		var listener=new listeners.CanvasMousemoveListener();
		listener.enter()
			.minMaxFloat('mousemovex','baz',0,1);
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	baz=(ev.clientX-rect.left)/(rect.width-1);",
			"});",
		]);
	});
	it('outputs code to get float value with y-axis, min/max declaration, value declaration',function(){
		var listener=new listeners.CanvasMousemoveListener();
		listener.enter()
			.minMaxVarFloat('mousemovey','bar','-100','+100');
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	var minBar=-100;",
			"	var maxBar=+100;",
			"	var bar=minBar+(maxBar-minBar)*(rect.bottom-1-ev.clientY)/(rect.height-1);",
			"});",
		]);
	});
	it('outputs code to get int value with y-axis, new value declaration',function(){
		var listener=new listeners.CanvasMousemoveListener();
		listener.enter()
			.newVarInt('mousemovey','depth');
		var lines=listener.write(false,false);
		assert.deepEqual(lines.data,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	var newDepth=Math.floor(minDepth+(maxDepth-minDepth+1)*(rect.bottom-1-ev.clientY)/rect.height);",
			"});",
		]);
	});
});
