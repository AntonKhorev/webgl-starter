var assert=require('assert');

var linesMetaclass=require('../src/lines.js');

describe('Lines',function(){
	it('is empty at the beginning',function(){
		var Lines=linesMetaclass('\t');
		var lines=new Lines;
		assert.deepEqual(lines.data,[]);
	});
	it('adds one line',function(){
		var Lines=linesMetaclass('\t');
		var lines=new Lines;
		lines.a(
			"Hello World"
		);
		assert.deepEqual(lines.data,[
			"Hello World"
		]);
	});
	it('adds two lines in one call',function(){
		var Lines=linesMetaclass('\t');
		var lines=new Lines;
		lines.a(
			"Hello",
			"World"
		);
		assert.deepEqual(lines.data,[
			"Hello",
			"World"
		]);
	});
	it('adds two lines in two calls',function(){
		var Lines=linesMetaclass('\t');
		var lines=new Lines;
		lines.a(
			"Hello"
		);
		lines.a(
			"World"
		);
		assert.deepEqual(lines.data,[
			"Hello",
			"World"
		]);
	});
	it('appends one line to last line',function(){
		var Lines=linesMetaclass('\t');
		var lines=new Lines;
		lines.a(
			"Hello"
		);
		lines.t(
			",World"
		);
		assert.deepEqual(lines.data,[
			"Hello,World"
		]);
	});
	it('appends several lines to last line',function(){
		var Lines=linesMetaclass('\t');
		var lines=new Lines;
		lines.a(
			"a"
		);
		lines.t(
			"*(",
			"	b+c",
			")"
		);
		assert.deepEqual(lines.data,[
			"a*(",
			"	b+c",
			")"
		]);
	});
	it('indents by one by default',function(){
		var Lines=linesMetaclass('\t');
		var lines=new Lines;
		lines.a(
			"1",
			"2",
			"3"
		);
		lines.indent();
		assert.deepEqual(lines.data,[
			"	1",
			"	2",
			"	3"
		]);
	});
	it('adds Lines object',function(){
		var Lines=linesMetaclass('\t');
		var lines=new Lines;
		var lines2=new Lines;
		lines2.a(
			"nested"
		);
		lines.a(
			lines2
		);
		assert.deepEqual(lines.data,[
			"nested"
		]);
	});
});
