/*
function htmlEncode(value) {
	return value.toString()
		.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
		.replace(/</g,'&lt;').replace(/>/g,'&gt;')
	; // https://github.com/emn178/js-htmlencode/blob/master/src/htmlencode.js
}
*/

/*
var OptionsSection=function(){
	this.added=[];
};
OptionsSection.prototype.add=function(name,type){
	function getDefaultValue() {
		if (Array.isArray(type)) {
			return
		} else if (type=='bool') {
			return false;
		} else if (type=='color') {
			return {
				r: 1.0,
				g: 1.0,
				b: 1.0,
			};
		}
	}
	this.added.push({
		name: name,
		type: type,
		value: getDefaultValue(),
	});
};

var Options=function(){
	//this.fixed= // TODO stuff like language
	this.code=new OptionsSection();
	this.code.add('clearBackground','bool');
	this.code.add('draw',['triangle','gasket']);
	this.code.add('rotate','bool');
	this.inputs=new OptionsSection(); // TODO recreate based on this.code
	this.inputs.add('fragmentColor','color');
};
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
	function colorComponentValue(intName) {
		return options[intName].toFixed(3);
	}
	function colorValue(name) {
		return colorComponentValue(name+'.value.r')+","+
		       colorComponentValue(name+'.value.g')+","+
		       colorComponentValue(name+'.value.b');
	}
	function colorInput(name) {
		return [].concat.apply([],
			['red','green','blue'].map(function(component){
				var c=component.charAt(0);
				var C=c.toUpperCase();
				var intName=name+'.value.'+c;
				var extName='my'+name.charAt(0).toUpperCase()+name.slice(1)+C;
				return [
					"<div>",
					"	<label for='"+extName+"'>Fragment color: "+component+"</label>",
					"	0% <input id='"+extName+"' type='range' min='0' max='1' step='0.001' value='"+colorComponentValue(intName)+"' /> 100%",
					"</div>",
				];
			})
		);
	}
	return [].concat([
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>Generated code</title>",
	],options['fragmentColor.input']?[
		"<style>",
		"	label {",
		"		display: inline-block;",
		"		width: 15em;",
		"		text-align: right;",
		"	}",
		"</style>",
	]:[],[
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
	],options['fragmentColor.input']?[
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
	],options['fragmentColor.input']?colorInput('fragmentColor'):[],[
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
	],options['fragmentColor.input']?[
		"	var fragmentColorLoc=gl.getUniformLocation(program,'fragmentColor');",
		"	function updateFragmentColor() {",
		"		gl.uniform3fv(fragmentColorLoc,['myFragmentColorR','myFragmentColorG','myFragmentColorB'].map(function(id){",
		"			return parseFloat(document.getElementById(id).value);",
		"		}));",
		"	}",
		"	updateFragmentColor();",
		"	[].forEach.call(document.querySelectorAll('#myFragmentColorR, #myFragmentColorG, #myFragmentColorB'),function(el){",
		"		el.addEventListener('change',updateFragmentColor);",
		"	});",
		"	",
	]:[],[
	],options.rotate?[].concat([
		"	var rotationAngleLoc=gl.getUniformLocation(program,'rotationAngle');",
		"	",
		"	var startTime=performance.now();",
		"	function updateCanvas(time) {",
	],indent(2,render()),[
		"		requestAnimationFrame(updateCanvas);",
		"	}",
		"	requestAnimationFrame(updateCanvas);",
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
			// inputs
			'fragmentColor.value.r': 1.0,
			'fragmentColor.value.g': 0.0,
			'fragmentColor.value.b': 0.0,
			'fragmentColor.input': false,
		};
		var code;
		function updateCode() {
			code.text(generateCode(options));
			hljs.highlightBlock(code[0]);
		}
		container.empty().append(
			$("<div>").append(
				$("<label>").text(" Clear background").prepend( // TODO fix misleading option name - background is clear (transparent) by default
					$("<input type='checkbox'>").change(function(){
						options.clearBackground=$(this).prop('checked');
						updateCode();
					})
				)
			)
		).append(
			$("<div>").append(
				$("<label>").text("Draw ").append(
					$("<select><option>triangle</option><option>gasket</option></select>").change(function(){
						options.draw=this.value;
						updateCode();
					})
				)
			)
		).append(
			$("<div>").append(
				$("<label>").text(" Animated rotation").prepend(
					$("<input type='checkbox'>").change(function(){
						options.rotate=$(this).prop('checked');
						updateCode();
					})
				)
			)
		).append(
			$("<div>").append(
				$("<label>").append("Fragment color: red 0% ").append(
					$("<input type='range' min='0' max='1' step='0.001' value='1'>").change(function(){
						options['fragmentColor.value.r']=parseFloat(this.value);
						updateCode();
					})
				).append(" 100%")
			)
		).append(
			$("<div>").append(
				$("<label>").append("Fragment color: green 0% ").append(
					$("<input type='range' min='0' max='1' step='0.001' value='0'>").change(function(){
						options['fragmentColor.value.g']=parseFloat(this.value);
						updateCode();
					})
				).append(" 100%")
			)
		).append(
			$("<div>").append(
				$("<label>").append("Fragment color: blue 0% ").append(
					$("<input type='range' min='0' max='1' step='0.001' value='0'>").change(function(){
						options['fragmentColor.value.b']=parseFloat(this.value);
						updateCode();
					})
				).append(" 100%")
			)
		).append(
			$("<div>").append(
				$("<label>").text(" Provide fragment color inputs to users").prepend(
					$("<input type='checkbox'>").change(function(){
						options['fragmentColor.input']=$(this).prop('checked');
						updateCode();
					})
				)
			)
		).append(
			$("<pre>").append(code=$("<code>").text(generateCode(options)))
		).append(
			$("<div>").append(
				$("<button type='button'>Run in new window</button>").click(function(){
					window.open(getHtmlDataUri(code.text()),"generatedCode");
				})
			).append(
				" running in new window doesn't work in Internet Explorer"
			)
		);
		hljs.highlightBlock(code[0]);
	});
});
