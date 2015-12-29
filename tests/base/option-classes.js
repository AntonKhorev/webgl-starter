'use strict';

const assert=require('assert');
const Option=require('../../src/base/option-classes.js');

describe("Base/Option.Base",()=>{
	it("receives name argument",()=>{
		class C extends Option.Base {
		}
		const c=new C('testing');
		assert.equal(c.name,'testing');
	});
});
