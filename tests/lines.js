var assert=require('assert');

var Lines=require('../src/lines.js');

describe('Lines',function(){
	it('has no lines at the beginning',function(){
		var lines=new Lines;
		assert.deepEqual(lines.data,[]);
	});
	it('is empty at the beginning',function(){
		var lines=new Lines;
		assert(lines.isEmpty());
	});
	it('is not empty if lines added',function(){
		var lines=new Lines(
			"something"
		);
		assert(!lines.isEmpty());
	});
	it('adds lines with ctor args',function(){
		var lines=new Lines(
			"foo",
			"bar"
		);
		assert.deepEqual(lines.data,[
			"foo",
			"bar"
		]);
	});
	it('adds one line',function(){
		var lines=new Lines;
		lines.a(
			"Hello World"
		);
		assert.deepEqual(lines.data,[
			"Hello World"
		]);
	});
	it('adds two lines in one call',function(){
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
	it('adds array of strings',function(){
		var lines=new Lines;
		lines.a([
			"1","2","3"
		]);
		assert.deepEqual(lines.data,[
			"1","2","3"
		]);
	});
	it('wraps nonempty lines',function(){
		var lines=new Lines;
		lines.a(
			"foo();",
			"bar();"
		).wrap(
			"function fooBar() {",
			"}"
		);
		assert.deepEqual(lines.data,[
			"function fooBar() {",
			"	foo();",
			"	bar();",
			"}"
		]);
	});
	it('wraps empty lines',function(){
		var lines=new Lines;
		lines.wrap(
			"function fubar() {",
			"}"
		);
		assert.deepEqual(lines.data,[
			"function fubar() {",
			"}"
		]);
	});
	it('wrapsIfNotEmpty nonempty lines',function(){
		var lines=new Lines;
		lines.a(
			"foo();",
			"bar();"
		).wrapIfNotEmpty(
			"function fooBar() {",
			"}"
		);
		assert.deepEqual(lines.data,[
			"function fooBar() {",
			"	foo();",
			"	bar();",
			"}"
		]);
	});
	it("doesn't wrapIfNotEmpty empty lines",function(){
		var lines=new Lines;
		lines.wrapIfNotEmpty(
			"function fubar() {",
			"}"
		);
		assert.deepEqual(lines.data,[
		]);
	});
	/*
	it('wraps each line',function(){
		var lines=new Lines(
			"Hello",
			"World"
		);
		lines.wrapEachLine(
			"<b>","</b>"
		);
		assert.deepEqual(lines.data,[
			"<b>Hello</b>",
			"<b>World</b>"
		]);
	});
	*/
	it('returns self after call to .a()',function(){
		var lines=new Lines;
		var o=lines.a('123');
		assert(o instanceof Lines);
	});
	it('returns self after call to .t()',function(){
		var lines=new Lines;
		lines.a('123');
		var o=lines.t('456');
		assert(o instanceof Lines);
	});
	it('returns self after call to .indent()',function(){
		var lines=new Lines;
		lines.a('123');
		var o=lines.indent();
		assert(o instanceof Lines);
	});
	it('joins lines',function(){
		var lines=new Lines(
			"foo",
			"bar"
		);
		var s=lines.join('\t');
		assert.equal(s,"foo\nbar");
	});
});
