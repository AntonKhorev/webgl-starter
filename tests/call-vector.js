'use strict';

const assert=require('assert');
const Options=require('../src/options.js');
const FeatureContext=require('../src/feature-context.js');
const CallVector=require('../src/call-vector.js');

describe("CallVector",function(){
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['LiveColor','color',[1.0,1.0,1.0,1.0]],
			];
		}
	}
	context("with constant components",function(){
		const options=new TestOptions({color:{
			r:0.2, g:0.3, b:0.4, a:0.5
		}});
		const vector=new CallVector('color',options.fix().color,'do.something',[1.0,1.0,1.0,1.0]);
		it("makes a call during init",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"do.something(0.200,0.300,0.400,0.500);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context("with constant components equal to default value",function(){
		const options=new TestOptions;
		const vector=new CallVector('color',options.fix().color,'do.something',[1.0,1.0,1.0,1.0]);
		it("doesn't make a call during init",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
			]);
		});
	});
	context("with 1 slider component",function(){
		const options=new TestOptions({color:{
			r:{value:0.2,input:'slider'}, g:0.3, b:0.4, a:0.5
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("requests sliders",function(){
			const testFeatureContext={};
			vector.requestFeatureContext(testFeatureContext);
			assert.deepEqual(testFeatureContext,{
				hasSliders: true,
				hasInputs: true,
			});
		});
		it("returns interface with update fn and slider listener",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"function updateColor() {",
				"	up(parseFloat(document.getElementById('color.r').value),0.300,0.400,0.500);",
				"}",
				"updateColor();",
				"document.getElementById('color.r').addEventListener('change',updateColor);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
		it("returns empty mousemove listener when not animated",function(){
			const featureContext=new FeatureContext(false);
			vector.getJsInitLines(featureContext);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context("with 2 slider components",function(){
		const options=new TestOptions({color:{
			r:{value:0.2,input:'slider'}, g:0.3, b:{value:0.4,input:'slider'}, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with update fn and 2 slider listeners",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"function updateColor() {",
				"	up(",
				"		parseFloat(document.getElementById('color.r').value),",
				"		0.300,",
				"		parseFloat(document.getElementById('color.b').value),",
				"		1.000",
				"	);",
				"}",
				"updateColor();",
				"document.getElementById('color.r').addEventListener('change',updateColor);",
				"document.getElementById('color.b').addEventListener('change',updateColor);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context("with 4 slider components",function(){
		const options=new TestOptions({color:{
			r:{value:0.2,input:'slider'}, g:{value:0.3,input:'slider'}, b:{value:0.4,input:'slider'}, a:{value:1.0,input:'slider'}
		}});
		const vector=new CallVector('color',options.fix().color,'obj.up',[0.0,0.0,0.0,0.0]);
		it("returns interface with map update fn and query slider listener",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"function updateColor() {",
				"	obj.up.apply(obj,['r','g','b','a'].map(function(c){",
				"		return parseFloat(document.getElementById('color.'+c).value);",
				"	}));",
				"}",
				"updateColor();",
				"[].forEach.call(document.querySelectorAll('[id^=\"color.\"]'),function(el){",
				"	el.addEventListener('change',updateColor);",
				"});"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context("with 1 mousemove component",function(){
		const options=new TestOptions({color:{
			r:{value:0.2,input:'mousemovex'}, g:0.3, b:0.4, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with mousemove listener",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"up(0.200,0.300,0.400,1.000);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	var colorR=(ev.clientX-rect.left)/(rect.width-1);",
				"	up(colorR,0.300,0.400,1.000);",
				"});"
			]);
		});
	});
	context("with 2 mousemove components",function(){
		const options=new TestOptions({color:{
			r:{value:0.2,input:'mousemovex'}, g:0.3, b:0.4, a:{value:1.0,input:'mousemovey'}
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with mousemove listener",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"up(0.200,0.300,0.400,1.000);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
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
		const options=new TestOptions({color:{
			r:{value:0.2,input:'mousemovex'}, g:{value:0.3,input:'slider'}, b:0.4, a:{value:1.0,input:'mousemovey'}
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with 2 state vars, update fn, slider listener and mousemove listener",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var colorR=0.200;",
				"var colorA=1.000;",
				"function updateColor() {",
				"	up(colorR,parseFloat(document.getElementById('color.g').value),0.400,colorA);",
				"}",
				"updateColor();",
				"document.getElementById('color.g').addEventListener('change',updateColor);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
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
		const options=new TestOptions({color:{
			r:{value:0.2,input:'mousemovex'}, g:{value:0.3,input:'slider'}, b:{value:0.4,input:'slider'}, a:{value:1.0,input:'mousemovey'}
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with 2 state vars, update fn, 2 slider listeners and mousemove listener",function(){
			const featureContext=new FeatureContext(false);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var colorR=0.200;",
				"var colorA=1.000;",
				"function updateColor() {",
				"	up(",
				"		colorR,",
				"		parseFloat(document.getElementById('color.g').value),",
				"		parseFloat(document.getElementById('color.b').value),",
				"		colorA",
				"	);",
				"}",
				"updateColor();",
				"document.getElementById('color.g').addEventListener('change',updateColor);",
				"document.getElementById('color.b').addEventListener('change',updateColor);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
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
