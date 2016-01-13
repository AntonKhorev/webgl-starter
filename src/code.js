'use strict';

//const fixOptHelp=require('./fixed-options-helpers.js');
const Lines=require('./lines.js');
const listeners=require('./listeners.js');
const Shape=require('./shape-classes.js');
const FeatureContext=require('./feature-context.js');
const Canvas=require('./canvas.js');
const Background=require('./background.js');
const Transforms=require('./transforms.js');
const Illumination=require('./illumination.js');

module.exports=function(options,i18n){
	// TODO replace them by option helpers
	/*
	function intOptionValue(name) {
		return parseInt(options[name]);
	}
	function floatOptionValue(name) {
		return options[name].toFixed(3);
	}
	*/
	function isMousemoveInput(name) {
		return ['mousemovex','mousemovey'].indexOf(options[name+'.input'])>=0;
	}

	const featureContext=new FeatureContext(options.debug);
	const canvas=new Canvas(options.canvas);
	const background=new Background(options.background);
	const transforms=new Transforms(options.transforms);
	const illumination=new Illumination(options.material,options.light);
	function makeShape() {
		const className=options.shape.type.charAt(0).toUpperCase()+options.shape.type.slice(1);
		return new Shape[className](
			options.shape,
			options.light.type!='off',
			options.material.scope=='vertex',
			options.material.scope=='face',
			illumination.getColorAttrs()
		);
	}
	const shape=makeShape();
	const features=[
		canvas,
		background,
		transforms,
		illumination,
		shape,
	];
	features.forEach(feature=>{
		feature.requestFeatureContext(featureContext);
	});

	function getHtmlStyleLines() {
		var lines=new Lines;
		if (featureContext.hasSliders) {
			lines.a(
				"label {",
				"	display: inline-block;",
				"	width: 15em;",
				"	text-align: right;",
				"}",
				".min {",
				"	display: inline-block;",
				"	width: 4em;",
				"	text-align: right;",
				"}",
				".max {",
				"	display: inline-block;",
				"	width: 4em;",
				"	text-align: left;",
				"}"
			);
		}
		return lines.wrapIfNotEmpty(
			"<style>",
			"</style>"
		);
	}
	function getVertexShaderLines() {
		const eyeAtInfinity=options.transforms.projection=='ortho';
		const needTransformedPosition=illumination.wantsTransformedPosition(eyeAtInfinity);
		function generateMain() {
			const lines=new Lines();
			lines.a(
				canvas.getGlslVertexOutputLines(),
				transforms.getGlslVertexOutputLines(shape.dim==2,needTransformedPosition)
			);
			/*
			if (needTransformedPosition) {
				lines.t(
					";"
				);
				lines.a(
					"gl_Position=transformedPosition"
				);
			}
			if (options.projection=='ortho') {
				if (canvas.providesAspect()) {
					lines.t(
						"*vec4(1.0/aspect,1.0,-1.0,1.0)" // correct aspect ratio and make coords right-handed
					);
				} else if (shape.dim>2) {
					lines.t(
						"*vec4(1.0,1.0,-1.0,1.0)" // make coords right-handed for 3d shapes
					);
				}
			} else if (options.projection=='perspective') {
				if (canvas.providesAspect()) {
					lines.t(
						"*mat4(",
						"	near/aspect, 0.0,  0.0,                   0.0,",
						"	0.0,         near, 0.0,                   0.0,",
						"	0.0,         0.0,  (near+far)/(near-far), 2.0*near*far/(near-far),",
						"	0.0,         0.0,  -1.0,                  0.0",
						")"
					);
				} else {
					lines.t(
						"*mat4(",
						"	near, 0.0,  0.0,                   0.0,",
						"	0.0,  near, 0.0,                   0.0,",
						"	0.0,  0.0,  (near+far)/(near-far), 2.0*near*far/(near-far),",
						"	0.0,  0.0,  -1.0,                  0.0",
						")"
					);
				}
			}
			lines.t(
				";"
			);
			var writeNormalTransformLines=function(){
				var lines=new Lines("");
				options.transformOrder.forEach(function(transformName){
					if (!options.needsTransform(transformName)) {
						return;
					}
					lines.t({
						'rotate.x': [
							"*mat3(",
							"	1.0, 0.0, 0.0,",
							"	0.0,  cx, -sx,",
							"	0.0,  sx,  cx",
							")"
						],
						'rotate.y': [
							"*mat3(",
							"	 cy, 0.0,  sy,",
							"	0.0, 1.0, 0.0,",
							"	-sy, 0.0,  cy",
							")"
						],
						'rotate.z': [
							"*mat3(",
							"	 cz, -sz, 0.0,",
							"	 sz,  cz, 0.0,",
							"	0.0, 0.0, 1.0",
							")"
						]
					}[transformName]);
				});
				return lines;
			};
			lines.a(
				illumination.getGlslVertexOutputLines(eyeAtInfinity,shape.hasNormals,writeNormalTransformLines())
			);
			*/
			return lines;
		}
		const lines=new Lines();
		lines.a(
			canvas.getGlslVertexDeclarationLines(),
			transforms.getGlslVertexDeclarationLines(shape.dim==2),
			illumination.getGlslVertexDeclarationLines(eyeAtInfinity,shape.dim>2),
			"void main() {",
			generateMain().indent(),
			"}"
		);
		return lines;
	}
	/*
	function generateFragmentShaderLines() {
		var lines=new Lines;
		var eyeAtInfinity=options.projection=='ortho';
		lines.a(
			"precision mediump float;"
		);
		lines.a(
			illumination.getGlslFragmentDeclarationLines(eyeAtInfinity),
			illumination.getGlslFragmentOutputLines(eyeAtInfinity,shape.twoSided).wrap(
				"void main() {",
				"}"
			)
		);
		return lines;
	}
	function generateHtmlControlMessageLines() {
		var lines=new Lines;
		function writeOptionGroup(group) {
			group.filter(function(option){
				return isMousemoveInput(option.name);
			}).forEach(function(option){
				lines.a(
					"<li>"+i18n('controls.type.'+options[option.name+'.input'])+" "+i18n('controls.to')+" <strong>"+i18n('options.'+option.name)+"</strong></li>"
				);
			});
		}
		writeOptionGroup(options.inputOptions);
		writeOptionGroup(options.transformOptions);
		return lines.wrapIfNotEmpty(
			"<ul>",
			"</ul>"
		);
	}
	*/
	function getHtmlInputLines() {
		var lines=new Lines;
		features.forEach(feature=>{
			lines.a(feature.getHtmlInputLines(i18n));
		});
		return lines;
	}
	function getJsInitLines() {
		function getMakeProgramLines() {
			const lines=new Lines;
			lines.a(
				"var vertexShader=gl.createShader(gl.VERTEX_SHADER);",
				"gl.shaderSource(vertexShader,vertexShaderSrc);",
				"gl.compileShader(vertexShader);"
			);
			if (options.debugShaders) {
				lines.a(
					"if (!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vertexShader));"
				);
			}
			lines.a(
				"var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);",
				"gl.shaderSource(fragmentShader,fragmentShaderSrc);",
				"gl.compileShader(fragmentShader);"
			);
			if (options.debugShaders) {
				lines.a(
					"if (!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fragmentShader));"
				);
			}
			lines.a(
				"var program=gl.createProgram();",
				"gl.attachShader(program,vertexShader);",
				"gl.attachShader(program,fragmentShader);",
				"gl.linkProgram(program);",
				"return program;"
			);
			return lines.wrap(
				"function makeProgram(vertexShaderSrc,fragmentShaderSrc) {",
				"}"
			);
		}
		const lines=new Lines;
		lines.a(
			getMakeProgramLines(),
			"var canvas=document.getElementById('myCanvas');",
			"var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');"
		);
		if (shape.elementIndexBits==32) {
			lines.a(
				"gl.getExtension('OES_element_index_uint');" // TODO check if null is returned and don't allow more elements
			);
		}
		if (shape.dim>2) {
			lines.a(
				"gl.enable(gl.DEPTH_TEST);"
			);
		}
		lines.a(
			"var program=makeProgram(",
			"	document.getElementById('myVertexShader').text,",
			"	document.getElementById('myFragmentShader').text",
			");",
			"gl.useProgram(program);"
		);
		features.forEach(feature=>{
			lines.a(feature.getJsInitLines(featureContext));
		});
		lines.a(
			featureContext.getJsAfterInitLines()
		);
		return lines;
	}
	/*
	function generateJsInputHandlerLines() {
		var writeListenerArgs=[!options.isAnimated(),options.debugInputs];
		var lines=new Lines;
		function writeListener(listener) {
			lines.a(
				listener.write.apply(listener,writeListenerArgs)
			);
		}
		var canvasMousemoveListener=new listeners.CanvasMousemoveListener();
		function canvasUpdater() {
			lines.a(
				"function updateAspect() {",
				"	gl.viewport(0,0,canvas.width,canvas.height);",
				"	gl.uniform1f(aspectLoc,canvas.width/canvas.height);",
				"}",
				"updateAspect();"
			);
		}
		function canvasListener(wh) {
			var optName='canvas.'+wh;
			if (options[optName+'.input']=='slider') {
				var listener=new listeners.SliderListener(optName);
				listener.enter()
					.log("console.log(this.id,'input value:',parseInt(this.value));")
					.post("canvas."+wh+"=parseInt(this.value);")
					.post("updateAspect();");
				writeListener(listener);
			}
		}
		if (options.hasInputsFor('canvas')) {
			lines.a(
				"var aspectLoc=gl.getUniformLocation(program,'aspect');"
			);
			canvasUpdater();
			canvasListener('width');
			canvasListener('height');
		}
		if (options.background=='solid') {
			lines.a(
				backgroundColorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener)
			);
		}
		lines.a(
			illumination.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener)
		);
		if (options['shapeLod.input']=='slider') {
			var listener=new listeners.SliderListener('shapeLod');
			listener.enter()
				.log("console.log(this.id,'input value:',parseInt(this.value));")
				.post("storeShape(parseInt(this.value));");
			writeListener(listener);
		} else if (isMousemoveInput('shapeLod')) {
			canvasMousemoveListener.enter()
				.newVarInt(options['shapeLod.input'],'shapeLod')
				.cond("newShapeLod!=shapeLod")
				.log("console.log('shapeLod input value:',newShapeLod);")
				.post("storeShape(newShapeLod);");
		}
		['x','y','z'].forEach(function(d){
			var D=d.toUpperCase();
			var optName='rotate.'+d;
			var varName='rotate'+D;
			var updateName='updateRotate'+D;
			if (options[optName+'.input']=='slider') {
				var listener=new listeners.SliderListener(optName);
				var entry=listener.enter()
					.log("console.log(this.id,'input value:',parseFloat(this.value));");
				if (options[optName+'.speed']==0 && options[optName+'.speed.input']=='constant') {
					lines.a(
						"var "+varName+"Loc=gl.getUniformLocation(program,'"+varName+"');",
						"function "+updateName+"() {",
						"	gl.uniform1f("+varName+"Loc,parseFloat(document.getElementById('"+optName+"').value));",
						"};",
						updateName+"();" // have to initialize the uniform even if default value is zero because the browser may keep prev value of slider on page reload
					);
					entry.post(updateName+"();");
				}
				writeListener(listener);
			} else if (isMousemoveInput(optName)) {
				if (options[optName+'.speed']==0 && options[optName+'.speed.input']=='constant') {
					lines.a(
						"var "+varName+"Loc=gl.getUniformLocation(program,'"+varName+"');",
						"gl.uniform1f("+varName+"Loc,"+floatOptionValue(optName)+");"
					);
					canvasMousemoveListener.enter()
						.minMaxVarFloat(options[optName+'.input'],varName,'-180','+180')
						.log("console.log('"+optName+" input value:',"+varName+");")
						.post("gl.uniform1f("+varName+"Loc,"+varName+");");
				} else {
					canvasMousemoveListener.enter()
						.state("var "+varName+"="+floatOptionValue(optName)+";")
						.minMaxFloat(options[optName+'.input'],varName,'-180','+180')
						.log("console.log('"+optName+" input value:',"+varName+");");
				}
			}
			if (options[optName+'.speed.input']=='slider') {
				var listener=new listeners.SliderListener(optName+'.speed');
				listener.enter()
					.log("console.log(this.id,'input value:',parseFloat(this.value));");
				writeListener(listener);
			} else if (isMousemoveInput(optName+'.speed')) {
				canvasMousemoveListener.enter()
					.state("var "+varName+"Speed="+floatOptionValue(optName+'.speed')+";")
					.minMaxFloat(options[optName+'.speed.input'],varName+'Speed','-360','+360')
					.log("console.log('"+optName+".speed input value:',"+varName+"Speed);");
			}
		});
		writeListener(canvasMousemoveListener);
		return lines;
	}
	*/
	function getJsLoopLines() {
		const lines=new Lines;
		features.forEach(feature=>{
			lines.a(feature.getJsLoopLines());
		});
		return lines;
		/*
		var needStartTime=false; // set by renderInner()
		var needPrevTime=false; // set by renderInner()
		function renderInner() {
			var needWrap=false; // set by renderInnerTransforms()
			function renderInnerTransforms() {
				var lines=new Lines;
				['x','y','z'].forEach(function(d){
					var D=d.toUpperCase();
					var optName='rotate.'+d;
					var varName='rotate'+D;
					var VarName=varName.charAt(0).toUpperCase()+varName.slice(1);
					var hasGamepadInput=options.inputOptions[0].availableGamepadInputTypes.indexOf(options[optName+'.input'])>=0;
					if (hasGamepadInput || options[optName+'.speed']!=0 || options[optName+'.speed.input']!='constant') {
						if (hasGamepadInput) {
							// no time needed branch
							var axis=0;
							var match=options[optName+'.input'].match(/\d/);
							if (match) axis=match[0];
							lines.a(
								"var min"+VarName+"="+floatOptionValue(optName+'.min')+";",
								"var max"+VarName+"="+floatOptionValue(optName+'.max')+";",
								"var "+varName+"="+floatOptionValue(optName)+";",
								"if (gamepad) {",
								"	"+varName+"=min"+VarName+"+(max"+VarName+"-min"+VarName+")*(gamepad.axes["+axis+"]+1)/2;",
								"}"
							);
						} else if (options[optName+'.speed.input']=='constant' && options[optName+'.input']=='constant') {
							// no rotation state branch
							needStartTime=true;
							lines.a(
								"var "+varName+"="+(options[optName]
									? floatOptionValue(optName)+"+"
									: ""
								)+floatOptionValue(optName+'.speed')+"*(time-startTime)/1000;"
							);
						} else {
							// rotation state branch
							needPrevTime=true;
							if (options[optName+'.input']=='slider') {
								lines.a(
									"var "+varName+"Input=document.getElementById('"+optName+"');",
									"var "+varName+"=parseFloat("+varName+"Input.value);"
								);
							}
							if (options[optName+'.speed.input']=='slider') {
								lines.a(
									"var "+varName+"SpeedInput=document.getElementById('"+optName+".speed');",
									"var "+varName+"Speed=parseFloat("+varName+"SpeedInput.value);"
								);
							}
							lines.a(
								varName+"+="+(options[optName+'.speed.input']=='constant'
									? floatOptionValue(optName+'.speed')
									: varName+"Speed"
								)+"*(time-prevTime)/1000;"
							);
							if (options[optName+'.input']=='slider') {
								needWrap=true;
								lines.a(
									varName+"=wrap("+varName+",180);",
									varName+"Input.value="+varName+";"
								);
							}
						}
						lines.a(
							"gl.uniform1f("+varName+"Loc,"+varName+");"
						);
					}
				});
				return lines;
			}
			var innerTransformsLines=renderInnerTransforms();
			var lines=new Lines;
			if (needWrap) {
				lines.a(
					"function wrap(v,maxAbsV) {",
					"	v%=maxAbsV*2;",
					"	if (Math.abs(v)<=maxAbsV) return v;",
					"	return v-(v>0?1:-1)*maxAbsV*2;",
					"}"
				);
			}
			if (options.background=='solid') {
				lines.a(
					"gl.clear(gl.COLOR_BUFFER_BIT);"
				);
			}
			if (options.hasGamepadInputs()) {
				lines.a(
					"var gamepad;",
					"var gamepads=(navigator.getGamepads ? navigator.getGamepads() : []);",
					"for (var i=0;i<gamepads.length;i++) {",
					"	if (gamepads[i]) {",
					"		gamepad=gamepads[i];",
					"		break;",
					"	}",
					"}"
				);
			}
			lines.a(
				innerTransformsLines,
				shape.writeDraw()
			);
			return lines;
		}
		var lines=new Lines;
		var innerLines=renderInner();
		if (options.isAnimated()) {
			['x','y','z'].forEach(function(d){
				var D=d.toUpperCase();
				var optName='rotate.'+d;
				var varName='rotate'+D;
				if (
					options.needsUniform(optName) && !(
						// no Loc was generated in generateInputHandlerLines()
						(options[optName+'.input']=='slider' || isMousemoveInput(optName)) &&
						options[optName+'.speed']==0 && options[optName+'.speed.input']=='constant'
					)
				) {
					lines.a(
						"var "+varName+"Loc=gl.getUniformLocation(program,'"+varName+"');"
					);
				}
				if (options[optName+'.speed.input']!='constant' && options[optName+'.input']=='constant') {
					lines.a(
						"var "+varName+"="+floatOptionValue(optName)+";"
					);
				}
			});
			if (needStartTime && needPrevTime) {
				lines.a(
					"var startTime=performance.now();",
					"var prevTime=startTime;"
				);
			} else if (needStartTime) {
				lines.a(
					"var startTime=performance.now();"
				);
			} else if (needPrevTime) {
				lines.a(
					"var prevTime=performance.now();"
				);
			}
		}
		// wrap inner render lines in function if needed
		if (options.isAnimated()) {
			lines.a(
				"function renderFrame(time) {",
				innerLines.indent()
			);
			if (needPrevTime) {
				lines.a(
					"	prevTime=time;"
				);
			}
			lines.a(
				"	requestAnimationFrame(renderFrame);",
				"}",
				"requestAnimationFrame(renderFrame);"
			);
		} else if (options.hasInputs()) {
			lines.a(
				"var frameId=null;",
				"function renderFrame() {",
				innerLines.indent(),
				"	frameId=null;",
				"}",
				"function scheduleFrame() {",
				"	if (frameId===null) {",
				"		frameId=requestAnimationFrame(renderFrame);",
				"	}",
				"}",
				"scheduleFrame();"
			);
		} else {
			lines.a(innerLines);
		}
		return lines;
		*/
	}

	const scriptLines=new Lines;
	scriptLines.interleave(
		getJsInitLines(),
		getJsLoopLines()
	).wrap(
		"<script>",
		"</script>"
	);
	const lines=new Lines;
	lines.a(
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>Generated code</title>",
		getHtmlStyleLines(),
		"<script id='myVertexShader' type='x-shader/x-vertex'>",
		getVertexShaderLines().indent(),
		"</script>",
		"<script id='myFragmentShader' type='x-shader/x-fragment'>",
		//generateFragmentShaderLines().indent(),
		"</script>",
		"</head>",
		"<body>",
		canvas.getHtmlCanvasLines(),
		//generateHtmlControlMessageLines(),
		getHtmlInputLines(),
		scriptLines,
		"</body>",
		"</html>"
	);
	return lines.join(
		options.formatting.indent=='tab' ? '\t' : Array(parseInt(options.formatting.indent)+1).join(' ')
	);
};
