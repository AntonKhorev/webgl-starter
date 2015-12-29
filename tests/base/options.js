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
			const ids=['foobar','letter'];
			const values=['foo','c'];
			options.root.entries.forEach((entry,i)=>{
				assert(entry instanceof Option.Select,"option entry type isn't Select");
				entry.inputEntries.forEach((inputEntry,j)=>{
					assert.equal(j,0,"more than one input entry");
					assert.equal(inputEntry.id,ids[i]);
					assert.equal(inputEntry.value,values[i]);
				});
			});
		});
	});
});
