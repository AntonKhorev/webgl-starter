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
		if (options.animation=='rotation') {
			lines.push(
				"uniform float rotationAngle;",
				"attribute vec2 position;"
			);
		} else {
			lines.push(
				"attribute vec4 position;"
			);
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
		if (options.animation=='rotation') {
			lines.push(
				"	float c=cos(radians(rotationAngle));",
				"	float s=sin(radians(rotationAngle));",
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
	function generateInputLines() {
		return [].concat.apply([],
			options.inputOptions.filter(function(option){
				return options[option.name+'.input'];
			}).map(function(option){
				return [
					"<div>",
					"	<label for='"+option.name+"'>"+i18n('options.'+option.name)+":</label>",
					"	<span class='min'>"+option.getMinLabel()+"</span> "+
						(option.getStep()==1
							? "<input type='range' id='"+option.name+"' min='"+option.getMin()+"' max='"+option.getMax()+"' value='"+intOptionValue(option.name)+"' />"
							: "<input type='range' id='"+option.name+"' min='"+option.getMin()+"' max='"+option.getMax()+"' step='"+option.getStep()+"' value='"+floatOptionValue(option.name)+"' />"
						)+
						" <span class='max'>"+option.getMaxLabel()+"</span>",
					"</div>",
				];
			})
		);
	}
	function generateShapeLines() {
		var c=options.shader=='vertex';
		function square() {
			return [
				"var nVertices=4;",
				"var vertices=new Float32Array([",
				"	// x    y    r    g    b",
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
				"	//                   x                      y    r    g    b",
				"	-Math.sin(0/3*Math.PI), Math.cos(0/3*Math.PI),"+(c?" 1.0, 0.0, 0.0,":""),
				"	-Math.sin(2/3*Math.PI), Math.cos(2/3*Math.PI),"+(c?" 0.0, 1.0, 0.0,":""),
				"	-Math.sin(4/3*Math.PI), Math.cos(4/3*Math.PI),"+(c?" 0.0, 0.0, 1.0,":""),
				"]);",
			];
		}
		function gasket() {
			lines=[];
			if (options['shape.gasket.depth.input']) {
				lines.push(
					"var gasketMaxDepth=10;",
					"var nMaxVertices=Math.pow(3,gasketMaxDepth)*3;",
					"var vertices=new Float32Array(nMaxVertices*"+(c?5:2)+");",
					"var nVertices;",
					"function storeGasketVertices(gasketDepth) {",
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
			if (options['shape.gasket.depth.input']) {
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
	function generateInputHandlerLines() {
		var lines=[];
		function updater(optionPrefix,updateFnName,allInputsPre,allInputsPost,someInputsPre,someInputsPost) {
			lines.push(
				"function "+updateFnName+"() {"
			);
			if (options.hasAllInputsFor(optionPrefix)) {
				lines.push(
					"	"+allInputsPre+"['r','g','b','a'].map(function(c){",
					"		return parseFloat(document.getElementById('"+optionPrefix+".'+c).value);",
					"	})"+allInputsPost
				);
			} else {
				lines.push(
					"	"+someInputsPre+['r','g','b','a'].map(function(c){
						var name=optionPrefix+'.'+c;
						if (options[name+'.input']) {
							return "parseFloat(document.getElementById('"+name+"').value)";
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
		function eventListener(optionPrefix,updateFnName) {
			var onlyInput=options.getOnlyInputFor(optionPrefix);
			if (onlyInput===null) {
				lines.push(
					"[].forEach.call(document.querySelectorAll('[id^=\""+optionPrefix+".\"]'),function(el){",
					"	el"
				);
			} else {
				lines.push(
					"document.getElementById('"+onlyInput.name+"')"
				);
			}
			if (options.animation=='rotation') {
				appendLinesToLastLine(lines,[
					".addEventListener('change',"+updateFnName+");",
				]);
			} else {
				appendLinesToLastLine(lines,[
					".addEventListener('change',function(){",
					"	"+updateFnName+"();",
					"	updateCanvas();",
					"});"
				]);
			}
			if (onlyInput===null) {
				lines.push(
					"});"
				);
			}
		}
		if (options.hasInputsFor('background.solid.color')) {
			updater(
				'background.solid.color','updateClearColor',
				'gl.clearColor.apply(gl,',');',
				'gl.clearColor(',');'
			);
			eventListener('background.solid.color','updateClearColor');
		}
		if (options.hasInputsFor('shader.single.color')) {
			lines.push(
				"var colorLoc=gl.getUniformLocation(program,'color');"
			);
			updater(
				'shader.single.color','updateColor',
				'gl.uniform4fv(colorLoc,',');',
				'gl.uniform4fv(colorLoc,[',']);'
			);
			eventListener('shader.single.color','updateColor');
		}
		if (options['shape.gasket.depth.input']) {
			lines.push(
				"document.getElementById('shape.gasket.depth').addEventListener('change',function(){",
				"	storeGasketVertices(parseInt(this.value));",
				"	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);"
			);
			if (options.animation!='rotation') {
				lines.push(
					"	updateCanvas();"
				);
			}
			lines.push(
				"});"
			);
		}
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
				if (options['animation.rotation.speed.input']) {
					lines.push(
						"var rotationSpeed=parseFloat(document.getElementById('animation.rotation.speed').value);",
						"rotationAngle+=rotationSpeed*360*(time-prevTime)/1000;",
						"gl.uniform1f(rotationAngleLoc,rotationAngle);"
					);
				} else {
					lines.push(
						"gl.uniform1f(rotationAngleLoc,"+floatOptionValue('animation.rotation.speed')+"*360*(time-startTime)/1000);"
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
			if (options['animation.rotation.speed.input']) {
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
		var needUpdateCanvasFunction=options.animation=='rotation'||options.hasInputs()
		if (needUpdateCanvasFunction) {
			lines.push(
				"function updateCanvas(time) {"
			);
			lines=lines.concat(
				indentLines(1,renderInner())
			);
			if (options.animation=='rotation') {
				if (options['animation.rotation.speed.input']) {
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
	],options.hasInputs()?[
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
	],generateInputLines(),[
		"<script>",
		"	function makeProgram(vertexShaderSrc,fragmentShaderSrc) {",
		"		var vertexShader=gl.createShader(gl.VERTEX_SHADER);",
		"		gl.shaderSource(vertexShader,vertexShaderSrc);",
		"		gl.compileShader(vertexShader);",
		"		if (!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vertexShader));",
		"		var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);",
		"		gl.shaderSource(fragmentShader,fragmentShaderSrc);",
		"		gl.compileShader(fragmentShader);",
		"		if (!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fragmentShader));",
		"		var program=gl.createProgram();",
		"		gl.attachShader(program,vertexShader);",
		"		gl.attachShader(program,fragmentShader);",
		"		gl.linkProgram(program);",
		"		return program;",
		"	}",
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
		"	var buffer=gl.createBuffer();",
		"	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);",
		"	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);",
		"	",
		"	var positionLoc=gl.getAttribLocation(program,'position');",
		"	gl.vertexAttribPointer(positionLoc,2,gl.FLOAT,false,0,0);",
		"	gl.enableVertexAttribArray(positionLoc);",
		"	",
	],indentLines(1,generateInputHandlerLines()),options.animation=='rotation'?[
		"	var rotationAngleLoc=gl.getUniformLocation(program,'rotationAngle');",
		"	",
	]:[],indentLines(1,generateRenderLines()),[
		"</script>",
		"</body>",
		"</html>",
	]).join("\n");
};
