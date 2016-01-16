'use strict';

const assert=require('assert');
const Options=require('../src/options.js');
const FeatureContext=require('../src/feature-context.js');
const CallVector=require('../src/call-vector.js');

describe("CallVector",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['LiveColor','color',[1.0,1.0,1.0,1.0]],
				['Group','debug',[
					['Checkbox','shaders',true],
					['Checkbox','arrays'],
					['Checkbox','inputs'],
				]],
			];
		}
	}
	context("with constant components",()=>{
		const options=new TestOptions({color:{
			r:0.2, g:0.3, b:0.4, a:0.5
		}});
		const vector=new CallVector('color',options.fix().color,'do.something',[1.0,1.0,1.0,1.0]);
		it("makes a call during init",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"do.something(0.200,0.300,0.400,0.500);"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
		it("has empty loop",()=>{
			assert.deepEqual(vector.getJsLoopLines().data,[
			]);
		});
	});
	context("with constant components equal to default value",()=>{
		const options=new TestOptions;
		const vector=new CallVector('color',options.fix().color,'do.something',[1.0,1.0,1.0,1.0]);
		it("doesn't make a call during init",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
			]);
		});
	});
	context("with 1 slider component",()=>{
		const options=new TestOptions({color:{
			r:{value:0.2,input:'slider'}, g:0.3, b:0.4, a:0.5
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("requests sliders",()=>{
			const testFeatureContext={};
			vector.requestFeatureContext(testFeatureContext);
			assert.deepEqual(testFeatureContext,{
				hasSliders: true,
				hasInputs: true,
			});
		});
		it("returns interface with update fn and slider listener",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
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
		it("returns empty mousemove listener when not animated",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			vector.getJsInitLines(featureContext);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
	});
	context("with 2 slider components",()=>{
		const options=new TestOptions({color:{
			r:{value:0.2,input:'slider'}, g:0.3, b:{value:0.4,input:'slider'}, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with update fn and 2 slider listeners",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
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
	context("with 4 slider components",()=>{
		const options=new TestOptions({color:{
			r:{value:0.2,input:'slider'}, g:{value:0.3,input:'slider'}, b:{value:0.4,input:'slider'}, a:{value:1.0,input:'slider'}
		}});
		const vector=new CallVector('color',options.fix().color,'obj.up',[0.0,0.0,0.0,0.0]);
		it("returns interface with map update fn and query slider listener",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
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
	context("with 1 mousemove component",()=>{
		const options=new TestOptions({color:{
			r:{value:0.2,input:'mousemovex'}, g:0.3, b:0.4, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with mousemove listener",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
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
	context("with 2 mousemove components",()=>{
		const options=new TestOptions({color:{
			r:{value:0.2,input:'mousemovex'}, g:0.3, b:0.4, a:{value:1.0,input:'mousemovey'}
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with mousemove listener",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
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
	context("with 1 slider and 2 mousemove components",()=>{
		const options=new TestOptions({color:{
			r:{value:0.2,input:'mousemovex'}, g:{value:0.3,input:'slider'}, b:0.4, a:{value:1.0,input:'mousemovey'}
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with 2 state vars, update fn, slider listener and mousemove listener",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
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
	context("with 2 sliders and 2 mousemove components",()=>{
		const options=new TestOptions({color:{
			r:{value:0.2,input:'mousemovex'}, g:{value:0.3,input:'slider'}, b:{value:0.4,input:'slider'}, a:{value:1.0,input:'mousemovey'}
		}});
		const vector=new CallVector('color',options.fix().color,'up',[0.0,0.0,0.0,0.0]);
		it("returns interface with 2 state vars, update fn, 2 slider listeners and mousemove listener",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
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
	context("with constant positive speed",()=>{
		const options=new TestOptions({color:{
			r:{value:0.5, speed:+0.123}, g:0.4, b:0.3, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'setColor',[1.0,1.0,1.0,1.0]);
		it("requests start time",()=>{
			const testFeatureContext={};
			vector.requestFeatureContext(testFeatureContext);
			assert.deepEqual(testFeatureContext,{
				hasStartTime: true,
			});
		});
		it("has no state vars",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
		it("has loop with constant increment",()=>{
			assert.deepEqual(vector.getJsLoopLines().data,[
				"var colorR=Math.min(0.500+0.123*(time-startTime)/1000,1.000);",
				"setColor(colorR,0.400,0.300,1.000);"
			]);
		});
	});
	context("with constant negative speed",()=>{
		const options=new TestOptions({color:{
			r:{value:0.5, speed:-0.1}, g:0.4, b:0.3, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'setColor',[1.0,1.0,1.0,1.0]);
		it("requests start time",()=>{
			const testFeatureContext={};
			vector.requestFeatureContext(testFeatureContext);
			assert.deepEqual(testFeatureContext,{
				hasStartTime: true,
			});
		});
		it("has no state vars",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasStartTime=true; // animated
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
		it("has loop with constant increment",()=>{
			assert.deepEqual(vector.getJsLoopLines().data,[
				"var colorR=Math.max(0.500-0.100*(time-startTime)/1000,0.000);",
				"setColor(colorR,0.400,0.300,1.000);"
			]);
		});
	});
	context("with constant positive speed and slider on different component",()=>{
		const options=new TestOptions({color:{
			r:{value:0.5, speed:+0.123}, g:{value:0.4, input:'slider'}, b:0.3, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'setColor',[1.0,1.0,1.0,1.0]);
		it("has no state vars",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasStartTime=true; // animated
			featureContext.hasSliders=true;
			featureContext.hasInputs=true;
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
		it("has loop with constant increment",()=>{
			assert.deepEqual(vector.getJsLoopLines().data,[
				"var colorR=Math.min(0.500+0.123*(time-startTime)/1000,1.000);",
				"setColor(colorR,parseFloat(document.getElementById('color.g').value),0.300,1.000);"
			]);
		});
	});
	context("with constant positive speed and slider on same component",()=>{
		const options=new TestOptions({color:{
			r:{value:0.5, input:'slider', speed:+0.123}, g:0.4, b:0.3, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'setColor',[1.0,1.0,1.0,1.0]);
		it("requests prev time and sliders",()=>{
			const testFeatureContext={};
			vector.requestFeatureContext(testFeatureContext);
			assert.deepEqual(testFeatureContext,{
				hasPrevTime: true,
				hasSliders: true,
				hasInputs: true,
			});
		});
		it("has no state vars",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasPrevTime=true; // animated
			featureContext.hasSliders=true;
			featureContext.hasInputs=true;
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
		it("has loop with time difference increment and slider update",()=>{
			assert.deepEqual(vector.getJsLoopLines().data,[
				"var colorRInput=document.getElementById('color.r');",
				"var colorR=Math.min(parseFloat(colorRInput.value)+0.123*(time-prevTime)/1000,1.000);",
				"colorRInput.value=colorR;",
				"setColor(colorR,0.400,0.300,1.000);"
			]);
		});
	});
	context("with constant positive speed and mousemove on different component",()=>{
		const options=new TestOptions({color:{
			r:{value:0.5, speed:+0.123}, g:{value:0.4, input:'mousemovex'}, b:0.3, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'setColor',[1.0,1.0,1.0,1.0]);
		it("requests start time",()=>{
			const testFeatureContext={};
			vector.requestFeatureContext(testFeatureContext);
			assert.deepEqual(testFeatureContext,{
				hasStartTime: true,
				hasInputs: true,
			});
		});
		it("has state var for mousemove component",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasStartTime=true; // animated
			featureContext.hasInputs=true;
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var colorG=0.400;"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	colorG=(ev.clientX-rect.left)/(rect.width-1);",
				"});"
			]);
		});
		it("has loop with constant increment",()=>{
			assert.deepEqual(vector.getJsLoopLines().data,[
				"var colorR=Math.min(0.500+0.123*(time-startTime)/1000,1.000);",
				"setColor(colorR,colorG,0.300,1.000);"
			]);
		});
	});
	context("with constant positive speed and mousemove on same component",()=>{
		const options=new TestOptions({color:{
			r:{value:0.5, input:'mousemovex', speed:+0.123}, g:0.4, b:0.3, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'setColor',[1.0,1.0,1.0,1.0]);
		it("requests prev time",()=>{
			const testFeatureContext={};
			vector.requestFeatureContext(testFeatureContext);
			assert.deepEqual(testFeatureContext,{
				hasPrevTime: true,
				hasInputs: true,
			});
		});
		it("has state var for mousemove component",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasPrevTime=true; // animated
			featureContext.hasInputs=true;
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var colorR=0.500;"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	colorR=(ev.clientX-rect.left)/(rect.width-1);",
				"});"
			]);
		});
		it("has loop with time difference increment",()=>{
			assert.deepEqual(vector.getJsLoopLines().data,[
				"colorR=Math.min(colorR+0.123*(time-prevTime)/1000,1.000);",
				"setColor(colorR,0.400,0.300,1.000);"
			]);
		});
	});
	context("with slider-controlled speed",()=>{
		const options=new TestOptions({color:{
			r:{value:0.5, speed:{input:'slider'}}, g:0.4, b:0.3, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'setColor',[1.0,1.0,1.0,1.0]);
		it("requests prev time, clamp fn and sliders",()=>{
			const testFeatureContext={};
			vector.requestFeatureContext(testFeatureContext);
			assert.deepEqual(testFeatureContext,{
				hasPrevTime: true,
				hasClampFn: true,
				hasSliders: true,
				hasInputs: true,
			});
		});
		it("has state var for component with speed",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasPrevTime=true; // animated
			featureContext.hasClampFn=true;
			featureContext.hasSliders=true;
			featureContext.hasInputs=true;
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var colorR=0.500;"
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
		it("has loop with time difference increment",()=>{
			assert.deepEqual(vector.getJsLoopLines().data,[
				"colorR=clamp(colorR+parseFloat(document.getElementById('color.r.speed').value)*(time-prevTime)/1000,0.000,1.000);",
				"setColor(colorR,0.400,0.300,1.000);"
			]);
		});
	});
	context("with slider-controlled speed and slider-controlled value",()=>{
		const options=new TestOptions({color:{
			r:{value:0.5, input:'slider', speed:{input:'slider'}}, g:0.4, b:0.3, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'setColor',[1.0,1.0,1.0,1.0]);
		it("requests prev time, clamp fn and sliders",()=>{
			const testFeatureContext={};
			vector.requestFeatureContext(testFeatureContext);
			assert.deepEqual(testFeatureContext,{
				hasPrevTime: true,
				hasClampFn: true,
				hasSliders: true,
				hasInputs: true,
			});
		});
		it("has no state vars",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasPrevTime=true; // animated
			featureContext.hasClampFn=true;
			featureContext.hasSliders=true;
			featureContext.hasInputs=true;
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
			]);
		});
		it("has loop with time difference increment",()=>{
			assert.deepEqual(vector.getJsLoopLines().data,[
				"var colorRInput=document.getElementById('color.r');",
				"var colorR=clamp(parseFloat(colorRInput.value)+parseFloat(document.getElementById('color.r.speed').value)*(time-prevTime)/1000,0.000,1.000);",
				"colorRInput.value=colorR;",
				"setColor(colorR,0.400,0.300,1.000);"
			]);
		});
	});
	context("with slider-controlled speed and slider-controlled value and input logging",()=>{
		const options=new TestOptions({color:{
			r:{value:0.5, input:'slider', speed:{input:'slider'}}, g:0.4, b:0.3, a:1.0
		}, debug:{
			inputs: true
		}});
		const vector=new CallVector('color',options.fix().color,'setColor',[1.0,1.0,1.0,1.0]);
		it("has input value logging",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasPrevTime=true; // animated
			featureContext.hasClampFn=true;
			featureContext.hasSliders=true;
			featureContext.hasInputs=true;
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				`[].forEach.call(document.querySelectorAll('[id^="color."]'),function(el){`,
				`	el.addEventListener('change',function(){`,
				`		console.log(this.id,'input value:',parseFloat(this.value));`,
				`	});`,
				`});`
			]);
		});
	});
	context("with mousemove-controlled speed",()=>{
		const options=new TestOptions({color:{
			r:{value:0.5, speed:{value:-0.321, input:'mousemovex'}}, g:0.4, b:0.3, a:1.0
		}});
		const vector=new CallVector('color',options.fix().color,'setColor',[1.0,1.0,1.0,1.0]);
		it("requests prev time and clamp fn",()=>{
			const testFeatureContext={};
			vector.requestFeatureContext(testFeatureContext);
			assert.deepEqual(testFeatureContext,{
				hasPrevTime: true,
				hasClampFn: true,
				hasInputs: true,
			});
		});
		it("has state vars for value and speed",()=>{
			const featureContext=new FeatureContext(options.fix().debug);
			featureContext.hasPrevTime=true; // animated
			featureContext.hasClampFn=true;
			featureContext.hasInputs=true;
			assert.deepEqual(vector.getJsInitLines(featureContext).data,[
				"var colorR=0.500;",
				"var colorRSpeed=-0.321;",
			]);
			assert.deepEqual(featureContext.getJsAfterInitLines().data,[
				"canvas.addEventListener('mousemove',function(ev){",
				"	var rect=this.getBoundingClientRect();",
				"	var minColorRSpeed=-360;",
				"	var maxColorRSpeed=+360;",
				"	colorRSpeed=minColorRSpeed+(maxColorRSpeed-minColorRSpeed)*(ev.clientX-rect.left)/(rect.width-1);",
				"});"
			]);
		});
		it("has loop with constant increment",()=>{
			assert.deepEqual(vector.getJsLoopLines().data,[
				"var colorR=clamp(colorR+colorRSpeed*(time-startTime)/1000,0.000,1.000);",
				"setColor(colorR,0.400,0.300,1.000);"
			]);
		});
	});
});
