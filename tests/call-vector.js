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
	context("with one slider component",function(){
		var vector=new CallVector('color','shader.color','rgba',{
			'shader.color.r':0.2, 'shader.color.r.input':'slider',   'shader.color.r.min':0, 'shader.color.r.max':1,
			'shader.color.g':0.3, 'shader.color.g.input':'constant', 'shader.color.g.min':0, 'shader.color.g.max':1,
			'shader.color.b':0.4, 'shader.color.b.input':'constant', 'shader.color.b.min':0, 'shader.color.b.max':1,
			'shader.color.a':0.5, 'shader.color.a.input':'constant', 'shader.color.a.min':0, 'shader.color.a.max':1
		},'do.something',[1.0,1.0,1.0,1.0]);
		it("doesn't make a call during init",function(){
			assert.deepEqual(vector.getJsInitLines().data,[
			]);
		});
	});
});
