hljs.initHighlightingOnLoad();

/*
function htmlEncode(value) {
	return value.toString()
		.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
		.replace(/</g,'&lt;').replace(/>/g,'&gt;')
	; // https://github.com/emn178/js-htmlencode/blob/master/src/htmlencode.js
}
*/

function generateCode() {
	return [
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>Generated code</title>",
		"<script id='myVertexShader' type='x-shader/x-vertex'>",
		"	attribute vec4 position;",
		"	void main() {",
		"		gl_Position=position;",
		"	}",
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
		"	var program=makeProgram(",
		"		document.getElementById('myVertexShader').text,",
		"		document.getElementById('myFragmentShader').text",
		"	);",
		"	gl.useProgram(program);",
		"	",
		"	var buffer=gl.createBuffer();",
		"	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);",
		"	gl.bufferData(",
		"		gl.ARRAY_BUFFER,",
		"		new Float32Array([",
		"			-1.0, -1.0,",
		"			 0.0,  1.0,",
		"			 1.0, -1.0,",
		"		]),",
		"		gl.STATIC_DRAW",
		"	);",
		"	",
		"	var positionLoc=gl.getAttribLocation(program,'position');",
		"	gl.vertexAttribPointer(positionLoc,2,gl.FLOAT,false,0,0);",
		"	gl.enableVertexAttribArray(positionLoc);",
		"	",
		"	gl.drawArrays(gl.TRIANGLES,0,3);",
		"</script>",
		"</body>",
		"</html>",
	].join("\n");
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
		var code;
		container.empty().append(
			$("<pre>").append(code=$("<code>").text(generateCode()))
		).append(
			$("<button type='button'>Run</button>").click(function(){
				window.open(getHtmlDataUri(code.text()),"generatedCode");
			})
		);
		//hljs.highlightBlock(code[0]);
	});
});
