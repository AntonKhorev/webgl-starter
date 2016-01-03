'use strict';

const assert=require('assert');
const Option=require('../../src/base/option-classes.js');
const Options=require('../../src/base/options.js');

/*
// unused for now
var VisiCheck=function(){
	this.visible=true;
};
VisiCheck.prototype.toggle=function(visibility){
	if (visibility===true || visibility===false) {
		this.visible=visibility;
	} else {
		throw "visibility value neither true nor false";
	}
};

describe("Visibility test utility",function(){
	it("works",function(){
		var $=new VisiCheck;
		assert($.visible);
		$.toggle(false);
		assert(!$.visible);
		$.toggle(true);
		assert($.visible);
		assert.throws(function(){
			$.toggle();
		});
	});
});
*/

describe("Base/Options",()=>{
	context("empty",()=>{
		it("has root",()=>{
			const options=new Options;
			assert(options.root instanceof Option.Root);
		});
		it("exports data",()=>{
			const options=new Options;
			assert.deepEqual(options.export(),{
			});
		});
	});
	context("selects",()=>{
		class TestOptions extends Options {
			get entriesDescription() {
				return [
					['Select','foobar',['foo','bar','baz']],
					['Select','letter',['a','b','c','d','e'],'c'],
				];
			}
		}
		it("has root",()=>{
			const options=new TestOptions;
			assert(options.root instanceof Option.Root);
		});
		it("traverses entries",()=>{
			const options=new TestOptions;
			const fullNames=['foobar','letter'];
			const values=['foo','c'];
			const availableValues=[['foo','bar','baz'],['a','b','c','d','e']];
			options.root.entries.forEach((option,i)=>{
				assert(option instanceof Option.Select,"option entry type isn't Select");
				assert.equal(option.fullName,fullNames[i]);
				assert.equal(option.value,values[i]);
				assert.deepEqual(option.availableValues,availableValues[i]);
			});
		});
		it("imports data",()=>{
			const options=new TestOptions({
				letter: 'e',
			});
			const values=['foo','e'];
			options.root.entries.forEach((option,i)=>{
				assert.equal(option.value,values[i]);
			});
		});
		it("exports unchanged data",()=>{
			const options=new TestOptions;
			assert.deepEqual(options.export(),{
			});
		});
		it("exports changed data",()=>{
			const options=new TestOptions;
			options.root.entries[0].value='bar';
			assert.deepEqual(options.export(),{
				foobar: 'bar',
			});
		});
	});
	context("groups and selects",()=>{
		class TestOptions extends Options {
			get entriesDescription() {
				return [
					['Group','silly',[
						['Select','foobar',['foo','bar','baz']],
						['Select','letter',['a','b','c','d','e'],'c'],
					]],
					['Group','stupid',[
						['Select','what',['nothing','something']],
					]],
				];
			}
		}
		it("has root",()=>{
			const options=new TestOptions;
			assert(options.root instanceof Option.Root);
		});
		it("traverses entries",()=>{
			const options=new TestOptions;
			const fullGroupNames=['silly','stupid'];
			const fullNames=[
				['silly.foobar','silly.letter'],
				['stupid.what'],
			];
			const values=[
				['foo','c'],
				['nothing']
			];
			const availableValues=[
				[['foo','bar','baz'],['a','b','c','d','e']],
				[['nothing','something']]
			];
			options.root.entries.forEach((option,i)=>{
				assert(option instanceof Option.Group,"option entry type isn't Group");
				assert.equal(option.fullName,fullGroupNames[i]);
				option.entries.forEach((option,j)=>{
					assert(option instanceof Option.Select,"option entry type isn't Select");
					assert.equal(option.fullName,fullNames[i][j]);
					assert.equal(option.value,values[i][j]);
					assert.deepEqual(option.availableValues,availableValues[i][j]);
				});
			});
		});
		it("imports data",()=>{
			const options=new TestOptions({
				silly: {
					foobar: 'baz'
				},
				stupid: {
					what: 'something'
				}
			});
			const values=[
				['baz','c'],
				['something']
			];
			options.root.entries.forEach((option,i)=>{
				option.entries.forEach((option,j)=>{
					assert.equal(option.value,values[i][j]);
				});
			});
		});
		it("exports unchanged data",()=>{
			const options=new TestOptions;
			assert.deepEqual(options.export(),{
			});
		});
		it("exports changed data",()=>{
			const options=new TestOptions;
			options.root.entries[0].entries[0].value='bar';
			options.root.entries[1].entries[0].value='something';
			assert.deepEqual(options.export(),{
				silly: {
					foobar: 'bar',
				},
				stupid: {
					what: 'something'
				}
			});
		});
	});
	context("checkbox and array of selects",()=>{
		class TestOptions extends Options {
			get entriesDescription() {
				return [
					['Checkbox','chk'],
					['Array','arr',[
						['Select','shape',['square','triangle','gasket','cube','hat','terrain']],
						['Select','scope',['global','vertex','face']],
						['Select','projection',['ortho','perspective']],
					]],
				];
			}
		}
		it("has default entries",()=>{
			const options=new TestOptions;
			assert.equal(options.root.entries.length,2);
			assert.equal(options.root.entries[0].value,false);
			assert.equal(options.root.entries[1].entries.length,0);
		});
		it("imports data",()=>{
			const options=new TestOptions({
				chk: true,
				arr: [
					{type: 'scope', data: 'face'},
					{type: 'shape', data: 'cube'},
					'projection',
					{type: 'scope'},
				]
			});
			assert.equal(options.root.entries.length,2);
			assert.equal(options.root.entries[0].value,true);
			assert.equal(options.root.entries[1].entries.length,4);
			const names=['scope','shape','projection','scope'];
			const fullNames=['arr.scope','arr.shape','arr.projection','arr.scope'];
			const values=['face','cube','ortho','global'];
			options.root.entries[1].entries.forEach((option,i)=>{
				assert.equal(option.name,names[i]);
				assert.equal(option.fullName,fullNames[i]);
				assert.equal(option.value,values[i]);
			});
		});
		it("exports changed data",()=>{
			const options=new TestOptions;
			options.root.entries[0].value=true;
			options.root.entries[1].addEntry('scope');
			options.root.entries[1].addEntry('shape');
			options.root.entries[1].entries[1].value='triangle';
			assert.deepEqual(options.export(),{
				chk: true,
				arr: [
					'scope',
					{type: 'shape', value: 'triangle'},
				],
			});
		});
	});
});
