var assert=require('assert');

var listeners=require('../src/listeners.js');

describe('CanvasMousemoveListener',function(){
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
});
