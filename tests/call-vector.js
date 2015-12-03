var assert=require('assert');

var CallVector=require('../src/call-vector.js');
var listeners=require('../src/listeners.js');

describe("CallVector",function(){
	context("with constant components",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'constant', 'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'constant', 'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'constant', 'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':0.5, 'shader.color.a.input':'constant', 'shader.color.a.min':0, 'shader.color.a.max':1
		},'do.something',[1.0,1.0,1.0,1.0]);
		it("makes a call during init",function(){
			assert.deepEqual(vector.getJsInitLines().data,[
				"do.something(0.200,0.300,0.400,0.500);"
			]);
		});
		it("returns empty interface",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(vector.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
			]);
		});
	});
	context("with constant components equal to default value",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':1.0, 'shader.color.r.input':'constant', 'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':1.0, 'shader.color.g.input':'constant', 'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':1.0, 'shader.color.b.input':'constant', 'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':1.0, 'shader.color.a.input':'constant', 'shader.color.a.min':0, 'shader.color.a.max':1
		},'do.something',[1.0,1.0,1.0,1.0]);
		it("doesn't make a call during init",function(){
			assert.deepEqual(vector.getJsInitLines().data,[
			]);
		});
	});
	context("with 1 slider component",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'slider',   'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'constant', 'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'constant', 'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':0.5, 'shader.color.a.input':'constant', 'shader.color.a.min':0, 'shader.color.a.max':1
		},'up',[0.0,0.0,0.0,0.0]);
		it("doesn't make a call during init",function(){
			assert.deepEqual(vector.getJsInitLines().data,[
			]);
		});
		it("returns interface with update fn and slider listener",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(vector.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"function updateColor() {",
				"	up(parseFloat(document.getElementById('shader.color.r').value),0.300,0.400,0.500);",
				"}",
				"updateColor();",
				"document.getElementById('shader.color.r').addEventListener('change',updateColor);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
			]);
		});
		it("returns empty mousemove listener when not animated",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			vector.getJsInterfaceLines([true,false],canvasMousemoveListener);
			assert.deepEqual(canvasMousemoveListener.write(true,false).data,[
			]);
		});
	});
	context("with 2 slider components",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'slider',   'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'constant', 'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'slider',   'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':1.0, 'shader.color.a.input':'constant', 'shader.color.a.min':0, 'shader.color.a.max':1
		},'up',[0.0,0.0,0.0,0.0]);
		it("doesn't make a call during init",function(){
			assert.deepEqual(vector.getJsInitLines().data,[
			]);
		});
		it("returns interface with update fn and 2 slider listeners",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(vector.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"function updateColor() {",
				"	up(",
				"		parseFloat(document.getElementById('shader.color.r').value),",
				"		0.300,",
				"		parseFloat(document.getElementById('shader.color.b').value),",
				"		1.000",
				"	);",
				"}",
				"updateColor();",
				"document.getElementById('shader.color.r').addEventListener('change',updateColor);",
				"document.getElementById('shader.color.b').addEventListener('change',updateColor);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
			]);
		});
	});
	/*
	// maybe don't want query listener here?
	context("with 3 slider components",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'slider',   'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'slider',   'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'slider',   'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':1.0, 'shader.color.a.input':'constant', 'shader.color.a.min':0, 'shader.color.a.max':1
		},'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with update fn and query slider listener",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(vector.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"function updateColor() {",
				"	up(",
				"		parseFloat(document.getElementById('shader.color.r').value),",
				"		parseFloat(document.getElementById('shader.color.g').value),",
				"		parseFloat(document.getElementById('shader.color.b').value),",
				"		1.000",
				"	);",
				"}",
				"updateColor();",
				"[].forEach.call(document.querySelectorAll('[id^=\"shader.color.\"]'),function(el){",
				"	el.addEventListener('change',updateColor);",
				"});"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
			]);
		});
	});
	*/
	context("with 4 slider components",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'slider',   'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'slider',   'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'slider',   'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':1.0, 'shader.color.a.input':'slider',   'shader.color.a.min':0, 'shader.color.a.max':1
		},'obj.up',[0.0,0.0,0.0,0.0]);
		it("returns interface with map update fn and query slider listener",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(vector.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"function updateColor() {",
				"	obj.up.apply(obj,['r','g','b','a'].map(function(c){",
				"		return parseFloat(document.getElementById('shader.color.'+c).value);",
				"	}));",
				"}",
				"updateColor();",
				"[].forEach.call(document.querySelectorAll('[id^=\"shader.color.\"]'),function(el){",
				"	el.addEventListener('change',updateColor);",
				"});"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
			]);
		});
	});
	context("with 1 mousemove component",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'mousemovex', 'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'constant',   'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'constant',   'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':1.0, 'shader.color.a.input':'constant',   'shader.color.a.min':0, 'shader.color.a.max':1
		},'up',[0.0,0.0,0.0,0.0]);
		it("makes a call during init",function(){
			assert.deepEqual(vector.getJsInitLines().data,[
				"up(0.200,0.300,0.400,1.000);"
			]);
		});
		it("returns interface with mousemove listener",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(vector.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	var colorR=(ev.clientX-rect.left)/(rect.width-1);",
				"	up(colorR,0.300,0.400,1.000);",
				"});"
			]);
		});
	});
	context("with 2 mousemove components",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'mousemovex', 'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'constant',   'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'constant',   'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':1.0, 'shader.color.a.input':'mousemovey', 'shader.color.a.min':0, 'shader.color.a.max':1
		},'up',[0.0,0.0,0.0,0.0]);
		it("makes a call during init",function(){
			assert.deepEqual(vector.getJsInitLines().data,[
				"up(0.200,0.300,0.400,1.000);"
			]);
		});
		it("returns interface with mousemove listener",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(vector.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	var colorR=(ev.clientX-rect.left)/(rect.width-1);",
				"	var colorA=(rect.bottom-1-ev.clientY)/(rect.height-1);",
				"	up(colorR,0.300,0.400,colorA);",
				"});"
			]);
		});
	});
	context("with 1 slider and 2 mousemove components",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'mousemovex', 'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'slider',     'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'constant',   'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':1.0, 'shader.color.a.input':'mousemovey', 'shader.color.a.min':0, 'shader.color.a.max':1
		},'up',[0.0,0.0,0.0,0.0]);
		it("doesn't make a call during init",function(){
			assert.deepEqual(vector.getJsInitLines().data,[
			]);
		});
		it("returns interface with 2 state vars, update fn, slider listener and mousemove listener",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(vector.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"var colorR=0.200;",
				"var colorA=1.000;",
				"function updateColor() {",
				"	up(colorR,parseFloat(document.getElementById('shader.color.g').value),0.400,colorA);",
				"}",
				"updateColor();",
				"document.getElementById('shader.color.g').addEventListener('change',updateColor);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	colorR=(ev.clientX-rect.left)/(rect.width-1);",
				"	colorA=(rect.bottom-1-ev.clientY)/(rect.height-1);",
				"	updateColor();",
				"});"
			]);
		});
	});
	context("with 2 sliders and 2 mousemove components",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'mousemovex', 'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'slider',     'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'slider',     'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':1.0, 'shader.color.a.input':'mousemovey', 'shader.color.a.min':0, 'shader.color.a.max':1
		},'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with 2 state vars, update fn, 2 slider listeners and mousemove listener",function(){
			var canvasMousemoveListener=new listeners.CanvasMousemoveListener;
			assert.deepEqual(vector.getJsInterfaceLines([false,false],canvasMousemoveListener).data,[
				"var colorR=0.200;",
				"var colorA=1.000;",
				"function updateColor() {",
				"	up(",
				"		colorR,",
				"		parseFloat(document.getElementById('shader.color.g').value),",
				"		parseFloat(document.getElementById('shader.color.b').value),",
				"		colorA",
				"	);",
				"}",
				"updateColor();",
				"document.getElementById('shader.color.g').addEventListener('change',updateColor);",
				"document.getElementById('shader.color.b').addEventListener('change',updateColor);"
			]);
			assert.deepEqual(canvasMousemoveListener.write(false,false).data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	colorR=(ev.clientX-rect.left)/(rect.width-1);",
				"	colorA=(rect.bottom-1-ev.clientY)/(rect.height-1);",
				"	updateColor();",
				"});"
			]);
		});
	});
});
