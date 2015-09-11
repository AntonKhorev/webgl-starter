var assert=require('assert');

var listeners=require('../src/listeners.js');

describe('SliderListener',function(){
	it('is empty',function(){
		var listener=new listeners.CanvasMousemoveListener();
		var entry=listener.enter();
		var lines=listener.write(false,false);
		assert.deepEqual(lines,[]);
	});
});

describe('CanvasMousemoveListener',function(){
	it('should only have preAction()',function(){
		var listener=new listeners.CanvasMousemoveListener();
		var entry=listener.enter();
		entry.pre("preAction();");
		var lines=listener.write(false,false);
		assert.deepEqual(lines,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	preAction();",
			"});",
		]);
	});
	it('should call updateCanvas() once if two entries are given',function(){
		var listener=new listeners.CanvasMousemoveListener();
		var entry1=listener.enter();
		var entry2=listener.enter();
		var lines=listener.write(true,false);
		assert.deepEqual(lines,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	updateCanvas();",
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
		assert.deepEqual(lines,[
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
		assert.deepEqual(lines,[
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();",
			"	preAction1();",
			"	preAction2();",
			"	postAction();",
			"});",
		]);
	});
});
