/*
function htmlEncode(value) {
	return value.toString()
		.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
		.replace(/</g,'&lt;').replace(/>/g,'&gt;')
	; // https://github.com/emn178/js-htmlencode/blob/master/src/htmlencode.js
}
*/

function generateCode(options) {
	function indent(level,lines) {
		return lines.map(function(line){
			return Array(level+1).join("	")+line;
		});
	}
	function render() {
		return [].concat(options.clearBackground?[
			"gl.clear(gl.COLOR_BUFFER_BIT);",
		]:[],options.rotate?[
			"gl.uniform1f(rotationAngleLoc,(time-startTime)*360/5000);",
		]:[],[
			"gl.drawArrays(gl.TRIANGLES,0,nVertices);",
		]);
	}
	return [].concat([
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>Generated code</title>",
		"<script id='myVertexShader' type='x-shader/x-vertex'>",
	],options.rotate?[
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
		"	void main() {",
		"		gl_FragColor=vec4(1.0,0.0,0.0,1.0);",
		"	}",
		"</script>",
		"</head>",
		"<body>",
		"<div><canvas id='myCanvas' width='512' height='512'></canvas></div>",
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
	],options.clearBackground?[
		"	gl.clearColor(1.0,1.0,1.0,1.0);",
	]:[],[
		"	var program=makeProgram(",
		"		document.getElementById('myVertexShader').text,",
		"		document.getElementById('myFragmentShader').text",
		"	);",
		"	gl.useProgram(program);",
		"	",
	],options.draw=='triangle'?[
		"	var nVertices=3;",
		"	var vertices=new Float32Array([",
		"		-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI),",
		"		-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI),",
		"		-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI),",
		"	]);",
	]:[],options.draw=='gasket'?[
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
	],options.rotate?[].concat([
		"	var rotationAngleLoc=gl.getUniformLocation(program,'rotationAngle');",
		"	",
		"	var startTime=performance.now();",
		"	function animate(time) {",
	],indent(2,render()),[
		"		requestAnimationFrame(animate);",
		"	}",
		"	requestAnimationFrame(animate);",
	]):indent(1,render()),[
		"</script>",
		"</body>",
		"</html>",
	]).join("\n");
}

function getHtmlDataUri(html) {
	// with base64: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa
	//return "data:text/html;charset=utf-8;base64,"+window.btoa(unescape(encodeURIComponent(str)));
	// without base64: https://en.wikipedia.org/wiki/Data_URI_scheme
	return 'data:text/html;charset=utf-8,'+encodeURIComponent(html);
}

$(function(){
	$('.webgl-starter').each(function(){
		var container=$(this);
		var options={
			clearBackground: false,
			draw: 'triangle',
			rotate: false,
		};
		var code;
		container.empty().append(
			$("<div>").append(
				$("<label>").text(" Clear background").prepend( // TODO fix misleading option name - background is clear (transparent) by default
					$("<input type='checkbox'>").change(function(){
						options.clearBackground=$(this).prop('checked');
						code.text(generateCode(options));
						hljs.highlightBlock(code[0]);
					})
				)
			)
		).append(
			$("<div>").append(
				$("<label>").text("Draw ").append(
					$("<select><option>triangle</option><option>gasket</option></select>").change(function(){
						options.draw=this.value;
						code.text(generateCode(options));
						hljs.highlightBlock(code[0]);
					})
				)
			)
		).append(
			$("<div>").append(
				$("<label>").text(" Animated rotation").prepend(
					$("<input type='checkbox'>").change(function(){
						options.rotate=$(this).prop('checked');
						code.text(generateCode(options));
						hljs.highlightBlock(code[0]);
					})
				)
			)
		).append(
			$("<pre>").append(code=$("<code>").text(generateCode(options)))
		).append(
			$("<button type='button'>Run</button>").click(function(){
				window.open(getHtmlDataUri(code.text()),"generatedCode");
			})
		);
		hljs.highlightBlock(code[0]);
	});
});
