module.exports=function(options,i18n){
	function floatOptionValue(name) {
		return options[name].toFixed(3);
	}
	function colorValue(prefix) {
		return floatOptionValue(prefix+'.r')+","+
		       floatOptionValue(prefix+'.g')+","+
		       floatOptionValue(prefix+'.b');
	}
	function indentLines(level,lines) {
		return lines.map(function(line){
			return Array(level+1).join("	")+line;
		});
	}

	function generateInputLines() {
		return [].concat.apply([],
			options.inputOptions.filter(function(option){
				return options[option.name+'.input'];
			}).map(function(option){
				return [
					"<div>",
					"	<label for='"+option.name+"'>"+i18n('options.'+option.name)+":</label>",
					"	"+option.availableValues[0]+" <input type='range' id='"+option.name+"' min='"+option.availableValues[0]+"' max='"+option.availableValues[1]+"' step='any' value='"+floatOptionValue(option.name)+"'> "+option.availableValues[1],
					"</div>",
				];
			})
		);
	}
	function generateInputHandlerLines() {
		lines=[];
		if (options.hasInputsFor('fragmentColor')) {
			lines.push(
				"var fragmentColorLoc=gl.getUniformLocation(program,'fragmentColor');",
				"function updateFragmentColor() {"
			);
			if (options.hasAllInputsFor('fragmentColor')) {
				lines.push(
					"	gl.uniform3fv(fragmentColorLoc,['r','g','b'].map(function(c){",
					"		return parseFloat(document.getElementById('fragmentColor.'+c).value);",
					"	}));"
				);
			} else {
				lines.push(
					"	gl.uniform3fv(fragmentColorLoc,["+['r','g','b'].map(function(c){
						var name='fragmentColor.'+c;
						if (options[name+'.input']) {
							return "parseFloat(document.getElementById('"+name+"').value)";
						} else {
							return floatOptionValue(name);
						}
					}).join()+"]);"
				);
			}
			lines.push(
				"}",
				"updateFragmentColor();",
				"[].forEach.call(document.querySelectorAll('[id^=\"fragmentColor.\"]'),function(el){"
			);
			if (options.animation=='rotation') {
				lines.push(
					"	el.addEventListener('change',updateFragmentColor);"
				)
			} else {
				lines.push(
					"	el.addEventListener('change',function(){",
					"		updateFragmentColor();",
					"		updateCanvas();",
					"	});"
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
				lines.push(
					"gl.uniform1f(rotationAngleLoc,(time-startTime)*360/5000);"
				);
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
			lines.push(
				"var startTime=performance.now();"
			);
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
		"</style>",
	]:[],[
		"<script id='myVertexShader' type='x-shader/x-vertex'>",
	],options.animation=='rotation'?[
		"	uniform float rotationAngle;",
		"	attribute vec2 position;",
		"	void main() {",
		"		float c=cos(radians(rotationAngle));",
		"		float s=sin(radians(rotationAngle));",
		"		gl_Position=vec4(mat2(",
		"			 c, s,",
		"			-s, c",
		"		)*position,0,1);",
		"	}",
	]:[
		"	attribute vec4 position;",
		"	void main() {",
		"		gl_Position=position;",
		"	}",
	],[
		"</script>",
		"<script id='myFragmentShader' type='x-shader/x-fragment'>",
		"	precision mediump float;",
	],options.hasInputsFor('fragmentColor')?[
		"	uniform vec3 fragmentColor;",
		"	void main() {",
		"		gl_FragColor=vec4(fragmentColor,1.0);",
		"	}",
	]:[
		"	void main() {",
		"		gl_FragColor=vec4("+colorValue('fragmentColor')+",1.0);",
		"	}",
	],[
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
	],options.background=='solid'?[
		"	gl.clearColor(1.0,1.0,1.0,1.0);",
	]:[],[
		"	var program=makeProgram(",
		"		document.getElementById('myVertexShader').text,",
		"		document.getElementById('myFragmentShader').text",
		"	);",
		"	gl.useProgram(program);",
		"	",
	],options.shape=='square'?[
		"	var nVertices=4;",
		"	var vertices=new Float32Array([",
		"		-0.5,-0.5,",
		"		+0.5,-0.5,",
		"		+0.5,+0.5,",
		"		-0.5,+0.5,",
		"	]);",
	]:[],options.shape=='triangle'?[
		"	var nVertices=3;",
		"	var vertices=new Float32Array([",
		"		-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI),",
		"		-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI),",
		"		-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI),",
		"	]);",
	]:[],options.shape=='gasket'?[
		"	var gasketDepth=6;",
		"	var nVertices=Math.pow(3,gasketDepth)*3;",
		"	var vertices=new Float32Array(nVertices*2);",
		"	function storeGasketVertices() {",
		"		var iv=0;",
		"		function pushVertex(v) {",
		"			vertices[iv++]=v[0]; vertices[iv++]=v[1];",
		"		}",
		"		function mix(a,b,m) {",
		"			return [",
		"				a[0]*(1-m)+b[0]*m,",
		"				a[1]*(1-m)+b[1]*m,",
		"			];",
		"		}",
		"		function triangle(depth,a,b,c) {",
		"			if (depth<=0) {",
		"				pushVertex(a);",
		"				pushVertex(b);",
		"				pushVertex(c);",
		"			} else {",
		"				var ab=mix(a,b,0.5);",
		"				var bc=mix(b,c,0.5);",
		"				var ca=mix(c,a,0.5);",
		"				triangle(depth-1,a,ab,ca);",
		"				triangle(depth-1,b,bc,ab);",
		"				triangle(depth-1,c,ca,bc);",
		"			}",
		"		}",
		"		triangle(",
		"			gasketDepth,",
		"			[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],",
		"			[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],",
		"			[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]",
		"		);",
		"	}",
		"	storeGasketVertices();",
	]:[],[
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
