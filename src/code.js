var listeners=require('./listeners.js');
var shapes=require('./shapes.js');

module.exports=function(options,i18n){
	function intOptionValue(name) {
		return parseInt(options[name]);
	}
	function floatOptionValue(name) {
		return options[name].toFixed(3);
	}
	function colorValue(prefix) {
		return floatOptionValue(prefix+'.r')+","+
		       floatOptionValue(prefix+'.g')+","+
		       floatOptionValue(prefix+'.b')+","+
		       floatOptionValue(prefix+'.a');
	}
	function glslColorValue(prefix) {
		var r=floatOptionValue(prefix+'.r');
		var g=floatOptionValue(prefix+'.g');
		var b=floatOptionValue(prefix+'.b');
		var a=floatOptionValue(prefix+'.a');
		if (r==a && g==a && b==a) {
			return a; // see OpenGL ES SL section 5.4.2
		} else {
			return r+","+g+","+b+","+a;
		}
	}
	function isMousemoveInput(name) {
		return ['mousemovex','mousemovey'].indexOf(options[name+'.input'])>=0;
	}
	function indentLines(level,lines) {
		return lines.map(function(line){
			return Array(level+1).join("	")+line;
		});
	}
	function appendLinesToLastLine(lines,addedLines) {
		var lastLine=lines.pop();
		var indent=/^\s*/.exec(lastLine)[0];
		addedLines.forEach(function(line,i){
			if (i==0) {
				lines.push(lastLine+line);
			} else {
				lines.push(indent+line);
			}
		});
	}

	function makeShape() {
		if (options.shape=='square') {
			return new shapes.Square(options.shader);
		} else if (options.shape=='triangle') {
			return new shapes.Triangle(options.shader);
		} else if (options.shape=='gasket') {
			return new shapes.Gasket(options.shader,intOptionValue('shape.gasket.depth'),options['shape.gasket.depth.input']!='constant');
		} else if (options.shape=='cube') {
			return new shapes.Cube(options.shader);
		}
	}
	var shape=makeShape();

	function generateVertexShaderLines() {
		var use2dTransform=(
			shape.dim==2 &&
			!options.needsTransform('rotate.x') &&
			!options.needsTransform('rotate.y') &&
			 options.needsTransform('rotate.z')
		);
		var lines=[];
		['x','y','z'].forEach(function(d){
			var D=d.toUpperCase();
			var optName='rotate.'+d;
			var varName='rotate'+D;
			if (options.needsUniform(optName)) {
				lines.push("uniform float "+varName+";");
			}
		});
		if (use2dTransform) {
			lines.push("attribute vec2 position;");
		} else {
			lines.push("attribute vec4 position;");
		}
		if (options.shader=='vertex' || options.shader=='face') {
			lines.push(
				"attribute vec4 color;",
				"varying vec4 interpolatedColor;" // TODO don't interpolate for shader=='face'
			);
		}
		lines.push(
			"void main() {"
		);
		['x','y','z'].forEach(function(d){
			var D=d.toUpperCase();
			var optName='rotate.'+d;
			var varName='rotate'+D;
			if (options.needsTransform(optName)) {
				if (options.needsUniform('rotate.'+d)) {
					lines.push(
						"	float c"+d+"=cos(radians("+varName+"));",
						"	float s"+d+"=sin(radians("+varName+"));"
					);
				} else {
					lines.push(
						"	float c"+d+"=cos(radians("+floatOptionValue(optName)+"));",
						"	float s"+d+"=sin(radians("+floatOptionValue(optName)+"));"
					);
				}
			}
		});
		if (options['canvas.width']!=options['canvas.height']) {
			lines.push(
				"	float aspect="+intOptionValue('canvas.height')+".0/"+intOptionValue('canvas.width')+".0;"
			);
		}
		lines.push(
			"	gl_Position="
		);
		if (options['canvas.width']!=options['canvas.height']) {
			appendLinesToLastLine(lines,[
				"vec4(aspect,1.0,1.0,1.0)*"
			]);
		}
		if (use2dTransform) {
			appendLinesToLastLine(lines,[
				"vec4(mat2(",
				"	 cz, sz,",
				"	-sz, cz",
				")*position,0,1);"
			]);
		} else {
			if (options.needsTransform('rotate.z')) {
				appendLinesToLastLine(lines,[
					"mat4(",
					"	 cz,  sz, 0.0, 0.0,",
					"	-sz,  cz, 0.0, 0.0,",
					"	0.0, 0.0, 1.0, 0.0,",
					"	0.0, 0.0, 0.0, 1.0",
					")*"
				]);
			}
			if (options.needsTransform('rotate.y')) {
				appendLinesToLastLine(lines,[
					"mat4(",
					"	 cy, 0.0, -sy, 0.0,",
					"	0.0, 1.0, 0.0, 0.0,",
					"	 sy, 0.0,  cy, 0.0,",
					"	0.0, 0.0, 0.0, 1.0",
					")*"
				]);
			}
			if (options.needsTransform('rotate.x')) {
				appendLinesToLastLine(lines,[
					"mat4(",
					"	1.0, 0.0, 0.0, 0.0,",
					"	0.0,  cx,  sx, 0.0,",
					"	0.0, -sx,  cx, 0.0,",
					"	0.0, 0.0, 0.0, 1.0",
					")*"
				]);
			}
			appendLinesToLastLine(lines,[
				"position;"
			]);
		}
		if (options.shader=='vertex' || options.shader=='face') {
			lines.push(
				"	interpolatedColor=color;"
			);
		}
		lines.push(
			"}"
		);
		return lines;
	}
	function generateFragmentShaderLines() {
		if (options.shader=='vertex' || options.shader=='face') {
			return [
				"varying vec4 interpolatedColor;",
				"void main() {",
				"	gl_FragColor=interpolatedColor;",
				"}",
			];
		} else if (options.hasInputsFor('shader.single.color')) {
			return [
				"uniform vec4 color;",
				"void main() {",
				"	gl_FragColor=color;",
				"}",
			];
		} else {
			return [
				"void main() {",
				"	gl_FragColor=vec4("+glslColorValue('shader.single.color')+");",
				"}",
			];
		}
	}
	function generateControlMessageLines() {
		var lines=[];
		function writeOptionGroup(group) {
			group.filter(function(option){
				return isMousemoveInput(option.name);
			}).forEach(function(option){
				lines.push(
					"	<li>"+i18n('controls.type.'+options[option.name+'.input'])+" "+i18n('controls.to')+" <strong>"+i18n('options.'+option.name)+"</strong></li>"
				);
			});
		}
		writeOptionGroup(options.inputOptions);
		writeOptionGroup(options.transformOptions);
		if (lines.length) {
			return ["<ul>"].concat(lines,["</ul>"]);
		} else {
			return [];
		}
	}
	function generateInputLines() {
		var lines=[];
		function writeOptionGroup(group) {
			group.filter(function(option){
				return options[option.name+'.input']=='slider';
			}).forEach(function(option){
				lines.push(
					"<div>",
					"	<label for='"+option.name+"'>"+i18n('options.'+option.name)+":</label>",
					"	<span class='min'>"+option.getMinLabel()+"</span> "+
						(option.getStep()==1
							? "<input type='range' id='"+option.name+"' min='"+option.getMin()+"' max='"+option.getMax()+"' value='"+intOptionValue(option.name)+"' />"
							: "<input type='range' id='"+option.name+"' min='"+option.getMin()+"' max='"+option.getMax()+"' step='"+option.getStep()+"' value='"+floatOptionValue(option.name)+"' />"
						)+
						" <span class='max'>"+option.getMaxLabel()+"</span>",
					"</div>"
				);
			});
		}
		writeOptionGroup(options.inputOptions);
		writeOptionGroup(options.transformOptions);
		return lines;
	}
	function generateMakeProgramLines() {
		lines=[
			"function makeProgram(vertexShaderSrc,fragmentShaderSrc) {",
			"	var vertexShader=gl.createShader(gl.VERTEX_SHADER);",
			"	gl.shaderSource(vertexShader,vertexShaderSrc);",
			"	gl.compileShader(vertexShader);",
		];
		if (options.debugShader) {
			lines.push(
				"	if (!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vertexShader));"
			);
		}
		lines.push(
			"	var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);",
			"	gl.shaderSource(fragmentShader,fragmentShaderSrc);",
			"	gl.compileShader(fragmentShader);"
		);
		if (options.debugShader) {
			lines.push(
				"	if (!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fragmentShader));"
			);
		}
		lines.push(
			"	var program=gl.createProgram();",
			"	gl.attachShader(program,vertexShader);",
			"	gl.attachShader(program,fragmentShader);",
			"	gl.linkProgram(program);",
			"	return program;",
			"}"
		);
		return lines;
	}
	function generateInputHandlerLines() {
		var lines=[];
		function writeListener(listener) {
			lines=lines.concat(
				listener.write(!options.isAnimated(),options.debugInputs)
			);
		}
		var canvasMousemoveListener=new listeners.CanvasMousemoveListener();
		function colorStates(optionPrefix,updateFnName,stateVarPrefix) {
			['r','g','b','a'].forEach(function(c){
				var name=optionPrefix+'.'+c;
				if (isMousemoveInput(name)) {
					lines.push(
						"var "+stateVarPrefix+c.toUpperCase()+'='+floatOptionValue(name)+';'
					);
				}
			});
		}
		function colorUpdater(optionPrefix,updateFnName,stateVarPrefix,allInputsPre,allInputsPost,someInputsPre,someInputsPost) {
			lines.push(
				"function "+updateFnName+"() {"
			);
			if (options.hasAllSliderInputsFor(optionPrefix)) {
				lines.push(
					"	"+allInputsPre+"['r','g','b','a'].map(function(c){",
					"		return parseFloat(document.getElementById('"+optionPrefix+".'+c).value);",
					"	})"+allInputsPost
				);
			// TODO hasAllStateInputsFor(optionPrefix)
			} else {
				lines.push(
					"	"+someInputsPre+['r','g','b','a'].map(function(c){
						var name=optionPrefix+'.'+c;
						if (options[name+'.input']=='slider') {
							return "parseFloat(document.getElementById('"+name+"').value)";
						} else if (isMousemoveInput(name)) {
							return stateVarPrefix+c.toUpperCase();
						} else {
							return floatOptionValue(name);
						}
					}).join()+someInputsPost
				);
			}
			lines.push(
				"}",
				updateFnName+"();"
			);
		}
		function colorSingleListener(optionPrefix,updateFnName,stateVarPrefix) {
			var onlyInput=options.getOnlyInputFor(optionPrefix);
			var listener;
			if (onlyInput===null) {
				listener=new listeners.MultipleSliderListener("[id^=\""+optionPrefix+".\"]");
			} else {
				listener=new listeners.SliderListener(onlyInput.name);
			}
			listener.enter()
				.log("console.log(this.id,'input value:',parseFloat(this.value));")
				.post(updateFnName+"();");
			writeListener(listener);
		}
		function colorMultipleListeners(optionPrefix,updateFnName,stateVarPrefix) {
			['r','g','b','a'].forEach(function(c){
				var name=optionPrefix+'.'+c;
				var varName=stateVarPrefix+c.toUpperCase();
				if (options[name+'.input']=='slider') {
					var listener=new listeners.SliderListener(name);
					listener.enter()
						.log("console.log(this.id,'input value:',parseFloat(this.value));")
						.post(updateFnName+"();");
					writeListener(listener);
				} else if (isMousemoveInput(name)) {
					canvasMousemoveListener.enter()
						.prexy(
							options[name+'.input'],
							varName+"=(ev.clientX-rect.left)/(rect.width-1);",
							varName+"=(rect.bottom-1-ev.clientY)/(rect.height-1);"
						)
						.log("console.log('"+name+" input value:',"+varName+");")
						.post(updateFnName+"();");
				}
			});
		}
		function colorListeners(optionPrefix,updateFnName,stateVarPrefix) {
			var needOnlyOneListener=['r','g','b','a'].every(function(c){
				var inputType=options[optionPrefix+'.'+c+'.input'];
				return inputType=='constant' || inputType=='slider';
			});
			if (needOnlyOneListener) {
				colorSingleListener(optionPrefix,updateFnName,stateVarPrefix);
			} else {
				colorMultipleListeners(optionPrefix,updateFnName,stateVarPrefix);
			}
		}
		function colorStatesAndUpdaterAndListeners(
			optionPrefix,updateFnName,stateVarPrefix,
			allInputsPre,allInputsPost,
			someInputsPre,someInputsPost
		) {
			colorStates(optionPrefix,updateFnName,stateVarPrefix);
			colorUpdater(optionPrefix,updateFnName,stateVarPrefix,allInputsPre,allInputsPost,someInputsPre,someInputsPost);
			colorListeners(optionPrefix,updateFnName,stateVarPrefix);
		}
		if (options.hasInputsFor('background.solid.color')) {
			colorStatesAndUpdaterAndListeners(
				'background.solid.color','updateClearColor','clearColor',
				'gl.clearColor.apply(gl,',');',
				'gl.clearColor(',');'
			);
		}
		if (options.hasInputsFor('shader.single.color')) {
			lines.push(
				"var colorLoc=gl.getUniformLocation(program,'color');"
			);
			colorStatesAndUpdaterAndListeners(
				'shader.single.color','updateColor','color',
				'gl.uniform4fv(colorLoc,',');',
				'gl.uniform4fv(colorLoc,[',']);'
			);
		}
		if (options['shape.gasket.depth.input']=='slider') {
			var listener=new listeners.SliderListener('shape.gasket.depth');
			listener.enter()
				.log("console.log(this.id,'input value:',parseInt(this.value));")
				.post("storeGasketVertices(parseInt(this.value));")
				.post("gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);");
			writeListener(listener);
		} else if (isMousemoveInput('shape.gasket.depth')) {
			canvasMousemoveListener.enter()
				.prexy(
					options['shape.gasket.depth.input'],
					"var newGasketDepth=Math.floor((gasketMaxDepth+1)*(ev.clientX-rect.left)/rect.width);",
					"var newGasketDepth=Math.floor((gasketMaxDepth+1)*(rect.bottom-1-ev.clientY)/rect.height);"
				)
				.cond("newGasketDepth!=gasketDepth")
				.log("console.log('shape.gasket.depth input value:',newGasketDepth);")
				.post("storeGasketVertices(newGasketDepth);")
				.post("gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);");
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
					lines.push(
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
					lines.push(
						"var "+varName+"Loc=gl.getUniformLocation(program,'"+varName+"');",
						"gl.uniform1f("+varName+"Loc,"+floatOptionValue(optName)+");"
					);
					canvasMousemoveListener.enter()
						.prexy(
							options[optName+'.input'],
							"var "+varName+"=180*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",
							"var "+varName+"=180*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));"
						)
						.log("console.log('"+optName+" input value:',"+varName+");")
						.post("gl.uniform1f("+varName+"Loc,"+varName+");");
				} else {
					canvasMousemoveListener.enter()
						.state("var "+varName+"="+floatOptionValue(optName)+";")
						.prexy(
							options[optName+'.input'],
							varName+"=180*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",
							varName+"=180*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));"
						)
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
					.prexy(
						options[optName+'.speed.input'],
						varName+"Speed=360*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",
						varName+"Speed=360*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));"
					)
					.log("console.log('"+optName+".speed input value:',"+varName+"Speed);");
			}
		});
		writeListener(canvasMousemoveListener);
		if (lines.length) lines.push("	");
		return lines;
	}
	function generateRenderLines() {
		var needStartTime=false; // set by renderInner()
		var needPrevTime=false; // set by renderInner()
		function renderInner() {
			var needWrap=false; // set by renderInnerTransforms()
			function renderInnerTransforms() {
				var lines=[];
				['x','y','z'].forEach(function(d){
					var D=d.toUpperCase();
					var optName='rotate.'+d;
					var varName='rotate'+D;
					if (options[optName+'.speed']!=0 || options[optName+'.speed.input']!='constant') {
						if (options[optName+'.speed.input']=='constant' && options[optName+'.input']=='constant') {
							// no rotation state branch
							needStartTime=true;
							lines.push(
								"var "+varName+"="+(options[optName]
									? floatOptionValue(optName)+"+"
									: ""
								)+floatOptionValue(optName+'.speed')+"*(time-startTime)/1000;"
							);
						} else {
							// rotation state branch
							needPrevTime=true;
							if (options[optName+'.input']=='slider') {
								lines.push(
									"var "+varName+"Input=document.getElementById('"+optName+"');",
									"var "+varName+"=parseFloat("+varName+"Input.value);"
								);
							}
							if (options[optName+'.speed.input']=='slider') {
								lines.push(
									"var "+varName+"SpeedInput=document.getElementById('"+optName+".speed');",
									"var "+varName+"Speed=parseFloat("+varName+"SpeedInput.value);"
								);
							}
							lines.push(
								varName+"+="+(options[optName+'.speed.input']=='constant'
									? floatOptionValue(optName+'.speed')
									: varName+"Speed"
								)+"*(time-prevTime)/1000;"
							);
							if (options[optName+'.input']=='slider') {
								needWrap=true;
								lines.push(
									varName+"=wrap("+varName+",180);",
									varName+"Input.value="+varName+";"
								);
							}
						}
						lines.push(
							"gl.uniform1f("+varName+"Loc,"+varName+");"
						);
					}
				});
				return lines;
			}
			var innerTransformsLines=renderInnerTransforms();
			var lines=[];
			if (needWrap) {
				lines.push(
					"function wrap(v,maxAbsV) {",
					"	v%=maxAbsV*2;",
					"	if (Math.abs(v)<=maxAbsV) return v;",
					"	return v-(v>0?1:-1)*maxAbsV*2;",
					"}"
				);
			}
			if (options.background=='solid') {
				lines.push(
					"gl.clear(gl.COLOR_BUFFER_BIT);"
				);
			}
			lines=lines.concat(
				innerTransformsLines,
				shape.writeDraw()
			);
			return lines;
		}
		var lines=[];
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
					lines.push(
						"var "+varName+"Loc=gl.getUniformLocation(program,'"+varName+"');"
					);
				}
				if (options[optName+'.speed.input']!='constant' && options[optName+'.input']=='constant') {
					lines.push(
						"var "+varName+"="+floatOptionValue(optName)+";"
					);
				}
			});
			if (needStartTime && needPrevTime) {
				lines.push(
					"var startTime=performance.now();",
					"var prevTime=startTime;"
				);
			} else if (needStartTime) {
				lines.push(
					"var startTime=performance.now();"
				);
			} else if (needPrevTime) {
				lines.push(
					"var prevTime=performance.now();"
				);
			}
		}
		var needUpdateCanvasFunction=options.isAnimated()||options.hasInputs();
		if (needUpdateCanvasFunction) {
			lines.push(
				"function updateCanvas(time) {"
			);
			lines=lines.concat(indentLines(1,innerLines));
			if (options.isAnimated()) {
				if (needPrevTime) {
					lines.push(
						"	prevTime=time;"
					);
				}
				lines.push(
					"	requestAnimationFrame(updateCanvas);"
				);
			}
			lines.push(
				"}"
			);
			if (options.isAnimated()) {
				lines.push(
					"requestAnimationFrame(updateCanvas);"
				);
			} else {
				lines.push(
					"updateCanvas();"
				);
			}
		} else {
			lines=lines.concat(innerLines);
		}
		return lines;
	}

	return [].concat([
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>Generated code</title>",
	],options.hasSliderInputs()?[
		"<style>",
		"	label {",
		"		display: inline-block;",
		"		width: 15em;",
		"		text-align: right;",
		"	}",
		"	.min {",
		"		display: inline-block;",
		"		width: 3em;",
		"		text-align: right;",
		"	}",
		"	.max {",
		"		display: inline-block;",
		"		width: 3em;",
		"		text-align: left;",
		"	}",
		"</style>",
	]:[],[
		"<script id='myVertexShader' type='x-shader/x-vertex'>",
	],indentLines(1,generateVertexShaderLines()),[
		"</script>",
		"<script id='myFragmentShader' type='x-shader/x-fragment'>",
		"	precision mediump float;",
	],indentLines(1,generateFragmentShaderLines()),[
		"</script>",
		"</head>",
		"<body>",
		"<div>",
		"	<canvas id='myCanvas' width='"+intOptionValue('canvas.width')+"' height='"+intOptionValue('canvas.height')+"'></canvas>",
		"</div>",
	],generateControlMessageLines(),generateInputLines(),[
		"<script>",
	],indentLines(1,generateMakeProgramLines()),[
		"	",
		"	var canvas=document.getElementById('myCanvas');",
		"	var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');",
	],(
		options.background=='solid' && !options.hasInputsFor('background.solid.color') && !(
			// default clear color in OpenGL
			options['background.solid.color.r']==0 &&
			options['background.solid.color.g']==0 &&
			options['background.solid.color.b']==0 &&
			options['background.solid.color.a']==0
		)
	)?[
		"	gl.clearColor("+colorValue('background.solid.color')+");",
	]:[],shape.dim>2?[
		"	gl.enable(gl.DEPTH_TEST);"
	]:[],[
		"	var program=makeProgram(",
		"		document.getElementById('myVertexShader').text,",
		"		document.getElementById('myFragmentShader').text",
		"	);",
		"	gl.useProgram(program);",
		"	",
	],indentLines(1,shape.writeInit()),[
		"	",
	],indentLines(1,generateInputHandlerLines()),indentLines(1,generateRenderLines()),[
		"</script>",
		"</body>",
		"</html>",
	]).join("\n");
};
