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
			options.root.entries.forEach((entry,i)=>{
				assert(entry instanceof Option.Select,"option entry type isn't Select");
				entry.inputEntries.forEach((inputEntry,n)=>{
					assert.equal(n,0,"more than one input entry");
					assert.equal(inputEntry.fullName,fullNames[i]);
					assert.equal(inputEntry.value,values[i]);
					assert.deepEqual(inputEntry.availableValues,availableValues[i]);
				});
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
			options.root.entries.forEach((entry,i)=>{
				assert(entry instanceof Option.Group,"option entry type isn't Group");
				assert.equal(entry.fullName,fullGroupNames[i]);
				entry.entries.forEach((entry,j)=>{
					assert(entry instanceof Option.Select,"option entry type isn't Select");
					entry.inputEntries.forEach((inputEntry,n)=>{
						assert.equal(n,0,"more than one input entry");
						assert.equal(inputEntry.fullName,fullNames[i][j]);
						assert.equal(inputEntry.value,values[i][j]);
						assert.deepEqual(inputEntry.availableValues,availableValues[i][j]);
					});
				});
			});
		});
	});
});
