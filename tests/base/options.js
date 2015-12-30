'use strict';

const assert=require('assert');
const Option=require('../../src/base/option-classes.js');
const Options=require('../../src/base/options.js');

describe("Base/Options",()=>{
	context("empty",()=>{
		const options=new Options;
		it("has root",()=>{
			assert(options.root instanceof Option.Root);
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
		};
		const options=new TestOptions;
		it("has root",()=>{
			assert(options.root instanceof Option.Root);
		});
		it("traverses entries",()=>{
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
		};
		const options=new TestOptions;
		it("has root",()=>{
			assert(options.root instanceof Option.Root);
		});
		it("traverses entries",()=>{
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
	});
});
