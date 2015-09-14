var listeners=require('./listeners.js');

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

	function generateVertexShaderLines() {
		lines=[];
		if (options.needsUniform('rotate.z')) {
			lines.push("uniform float rotateZ;");
		}
		if (options.needsTransform('rotate.z')) {
			lines.push("attribute vec2 position;");
		} else {
			lines.push("attribute vec4 position;");
		}
		if (options.shader=='vertex') {
			lines.push(
				"attribute vec4 color;",
				"varying vec4 interpolatedColor;"
			);
		}
		lines.push(
			"void main() {"
		);
		if (options.needsTransform('rotate.z')) {
			if (options.needsUniform('rotate.z')) {
				lines.push(
					"	float c=cos(radians(rotateZ));",
					"	float s=sin(radians(rotateZ));"
				);
			} else {
				lines.push(
					"	float c=cos(radians("+floatOptionValue('rotate.z.position')+"));",
					"	float s=sin(radians("+floatOptionValue('rotate.z.position')+"));"
				);
			}
			lines.push(
				"	gl_Position=vec4(mat2(",
				"		 c, s,",
				"		-s, c",
				"	)*position,0,1);"
			);
		} else {
			lines.push(
				"	gl_Position=position;"
			);
		}
		if (options.shader=='vertex') {
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
		if (options.shader=='vertex') {
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
				"	gl_FragColor=vec4("+colorValue('shader.single.color')+");",
				"}",
			];
		}
	}
	function generateControlMessageLines() {
		var lines=options.inputOptions.filter(function(option){
			return isMousemoveInput(option.name);
		}).map(function(option){
			return "	<li>"+i18n('controls.type.'+options[option.name+'.input'])+" "+i18n('controls.to')+" <strong>"+i18n('options.'+option.name)+"</strong></li>";
		});
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
	function generateShapeLines() {
		var c=options.shader=='vertex';
		function square() {
			return [
				"var nVertices=4;",
				"var vertices=new Float32Array([",
				"	// x    y"+(c?"    r    g    b":""),
				"	-0.5,-0.5,"+(c?" 1.0, 0.0, 0.0,":""),
				"	+0.5,-0.5,"+(c?" 0.0, 1.0, 0.0,":""),
				"	+0.5,+0.5,"+(c?" 0.0, 0.0, 1.0,":""),
				"	-0.5,+0.5,"+(c?" 1.0, 1.0, 0.0,":""),
				"]);",
			];
		}
		function triangle() {
			return [
				"var nVertices=3;",
				"var vertices=new Float32Array([",
				"	//                   x                      y"+(c?"    r    g    b":""),
				"	-Math.sin(0/3*Math.PI), Math.cos(0/3*Math.PI),"+(c?" 1.0, 0.0, 0.0,":""),
				"	-Math.sin(2/3*Math.PI), Math.cos(2/3*Math.PI),"+(c?" 0.0, 1.0, 0.0,":""),
				"	-Math.sin(4/3*Math.PI), Math.cos(4/3*Math.PI),"+(c?" 0.0, 0.0, 1.0,":""),
				"]);",
			];
		}
		function gasket() {
			lines=[];
			if (options['shape.gasket.depth.input']!='constant') {
				lines.push(
					"var gasketMaxDepth=10;",
					"var nMaxVertices=Math.pow(3,gasketMaxDepth)*3;",
					"var vertices=new Float32Array(nMaxVertices*"+(c?5:2)+");",
					"var gasketDepth,nVertices;",
					"function storeGasketVertices(newGasketDepth) {",
					"	gasketDepth=newGasketDepth",
					"	nVertices=Math.pow(3,gasketDepth)*3;"
				);
			} else {
				lines.push(
					"var gasketDepth="+intOptionValue('shape.gasket.depth')+";",
					"var nVertices=Math.pow(3,gasketDepth)*3;",
					"var vertices=new Float32Array(nVertices*"+(c?5:2)+");",
					"function storeGasketVertices() {"
				);
			}
			lines.push(
				"	var iv=0;"
			);
			if (c) {
				lines.push(
					"	function pushVertex(v,r,g,b) {",
					"		vertices[iv++]=v[0]; vertices[iv++]=v[1];",
					"		vertices[iv++]=r; vertices[iv++]=g; vertices[iv++]=b;",
					"	}"
				);
			} else {
				lines.push(
					"	function pushVertex(v) {",
					"		vertices[iv++]=v[0]; vertices[iv++]=v[1];",
					"	}"
				);
			}
			lines.push(
				"	function mix(a,b,m) {",
				"		return [",
				"			a[0]*(1-m)+b[0]*m,",
				"			a[1]*(1-m)+b[1]*m,",
				"		];",
				"	}",
				"	function triangle(depth,a,b,c) {",
				"		if (depth<=0) {"
			);
			if (c) {
				lines.push(
					"			pushVertex(a,1.0,0.0,0.0);",
					"			pushVertex(b,0.0,1.0,0.0);",
					"			pushVertex(c,0.0,0.0,1.0);"
				);
			} else {
				lines.push(
					"			pushVertex(a);",
					"			pushVertex(b);",
					"			pushVertex(c);"
				);
			}
			lines.push(
				"		} else {",
				"			var ab=mix(a,b,0.5);",
				"			var bc=mix(b,c,0.5);",
				"			var ca=mix(c,a,0.5);",
				"			triangle(depth-1,a,ab,ca);",
				"			triangle(depth-1,b,bc,ab);",
				"			triangle(depth-1,c,ca,bc);",
				"		}",
				"	}",
				"	triangle(",
				"		gasketDepth,",
				"		[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],",
				"		[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],",
				"		[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]",
				"	);",
				"}"
			);
			if (options['shape.gasket.depth.input']!='constant') {
				lines.push(
					"storeGasketVertices("+intOptionValue('shape.gasket.depth')+");"
				);
			} else {
				lines.push(
					"storeGasketVertices();"
				);
			}
			return lines;
		}
		if (options.shape=='square') {
			return square();
		} else if (options.shape=='triangle') {
			return triangle();
		} else if (options.shape=='gasket') {
			return gasket();
		}
	}
	function generateBufferLines() {
		var lines=[
			"var buffer=gl.createBuffer();",
			"gl.bindBuffer(gl.ARRAY_BUFFER,buffer);",
			"gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);",
			"",
			"var positionLoc=gl.getAttribLocation(program,'position');",
		];
		if (options.shader=='vertex') {
			lines.push(
				"gl.vertexAttribPointer(",
				"	positionLoc,2,gl.FLOAT,false,",
				"	Float32Array.BYTES_PER_ELEMENT*5,",
				"	Float32Array.BYTES_PER_ELEMENT*0",
				");",
				"gl.enableVertexAttribArray(positionLoc);",
				"",
				"var colorLoc=gl.getAttribLocation(program,'color');",
				"gl.vertexAttribPointer(",
				"	colorLoc,3,gl.FLOAT,false,",
				"	Float32Array.BYTES_PER_ELEMENT*5,",
				"	Float32Array.BYTES_PER_ELEMENT*2",
				");",
				"gl.enableVertexAttribArray(colorLoc);"
			);
		} else {
			lines.push(
				"gl.vertexAttribPointer(positionLoc,2,gl.FLOAT,false,0,0);",
				"gl.enableVertexAttribArray(positionLoc);"
			);
		}
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
		if (options['rotate.z.position.input']=='slider') {
			var listener=new listeners.SliderListener('rotate.z.position');
			var entry=listener.enter()
				.log("console.log(this.id,'input value:',parseFloat(this.value));");
			if (options['rotate.z.speed']==0 && options['rotate.z.speed.input']=='constant') {
				lines.push(
					"var rotateZLoc=gl.getUniformLocation(program,'rotateZ');",
					"function updateRotateZ() {",
					"	gl.uniform1f(rotateZLoc,parseFloat(document.getElementById('rotate.z.position').value));",
					"};",
					"updateRotateZ();"
				);
				entry.post("updateRotateZ();");
			}
			writeListener(listener);
		} /* TODO else if (isMousemoveInput('rotate.z.position')) {
			canvasMousemoveListener.enter()
				.state("var rotateZPosition="+floatOptionValue('rotate.z.position')+";")
				.prexy(
					options['rotate.z.position.input'],
					"rotationSpeed=-1+2*(ev.clientX-rect.left)/(rect.width-1);",
					"rotationSpeed=-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1);"
				)
				.log("console.log('rotate.z.speed input value:',rotationSpeed);");
		} */
		if (options['rotate.z.speed.input']=='slider') {
			var listener=new listeners.SliderListener('rotate.z.speed');
			listener.enter()
				.log("console.log(this.id,'input value:',parseFloat(this.value));");
			writeListener(listener);
		} /* TODO else if (isMousemoveInput('rotate.z.speed')) {
			canvasMousemoveListener.enter()
				.state("var rotationSpeed="+floatOptionValue('rotate.z.speed')+";")
				.prexy(
					options['rotate.z.speed.input'],
					"rotationSpeed=-1+2*(ev.clientX-rect.left)/(rect.width-1);",
					"rotationSpeed=-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1);"
				)
				.log("console.log('rotate.z.speed input value:',rotationSpeed);");
		} */
		writeListener(canvasMousemoveListener);
		if (lines.length) lines.push("	");
		return lines;
	}
	function generateRenderLines() {
		function renderInner() {
			var lines=[];
			if (options.background=='solid') {
				lines.push(
					"gl.clear(gl.COLOR_BUFFER_BIT);"
				);
			}
			if (options.animation=='rotation') {
				if (options['animation.rotation.speed.input']=='constant') {
					lines.push(
						"gl.uniform1f(rotationAngleLoc,"+floatOptionValue('animation.rotation.speed')+"*360*(time-startTime)/1000);"
					);
				} else {
					if (options['animation.rotation.speed.input']=='slider') {
						lines.push(
							"var rotationSpeed=parseFloat(document.getElementById('animation.rotation.speed').value);"
						);
					}
					lines.push(
						"rotationAngle+=rotationSpeed*360*(time-prevTime)/1000;",
						"gl.uniform1f(rotationAngleLoc,rotationAngle);"
					);
				}
			}
			if (options.shape=='square') {
				lines.push(
					"gl.drawArrays(gl.TRIANGLE_FAN,0,nVertices);"
				);
			} else {
				lines.push(
					"gl.drawArrays(gl.TRIANGLES,0,nVertices);"
				);
			}
			return lines;
		}
		var lines=[];
		if (options.animation=='rotation') {
			if (options['animation.rotation.speed.input']!='constant') {
				// angle needs to be a state only if speed is controllable
				lines.push(
					"var rotationAngle=0;",
					"var prevTime=performance.now();"
				);
			} else {
				lines.push(
					"var startTime=performance.now();"
				);
			}
		}
		var needUpdateCanvasFunction=options.animation=='rotation'||options.hasInputs();
		if (needUpdateCanvasFunction) {
			lines.push(
				"function updateCanvas(time) {"
			);
			lines=lines.concat(
				indentLines(1,renderInner())
			);
			if (options.animation=='rotation') {
				if (options['animation.rotation.speed.input']!='constant') {
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
			if (options.animation=='rotation') {
				lines.push(
					"requestAnimationFrame(updateCanvas);"
				);
			} else {
				lines.push(
					"updateCanvas();"
				);
			}
		} else {
			lines=lines.concat(
				renderInner()
			);
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
		"		width: 1.5em;",
		"		text-align: right;",
		"	}",
		"	.max {",
		"		display: inline-block;",
		"		width: 1.5em;",
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
		"	<canvas id='myCanvas' width='512' height='512'></canvas>",
		"</div>",
	],generateControlMessageLines(),generateInputLines(),[
		"<script>",
	],indentLines(1,generateMakeProgramLines()),[
		"	",
		"	var canvas=document.getElementById('myCanvas');",
		"	var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');",
	],(options.background=='solid' && !options.hasInputsFor('background.solid.color'))?[
		"	gl.clearColor("+colorValue('background.solid.color')+");",
	]:[],[
		"	var program=makeProgram(",
		"		document.getElementById('myVertexShader').text,",
		"		document.getElementById('myFragmentShader').text",
		"	);",
		"	gl.useProgram(program);",
		"	",
	],indentLines(1,generateShapeLines()),[
		"	",
	],indentLines(1,generateBufferLines()),[
		"	",
	],indentLines(1,generateInputHandlerLines()),options.isAnimated()?[
		"	var rotationAngleLoc=gl.getUniformLocation(program,'rotationAngle');",
		"	",
	]:[],indentLines(1,generateRenderLines()),[
		"</script>",
		"</body>",
		"</html>",
	]).join("\n");
};
