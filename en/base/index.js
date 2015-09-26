!function e(t,n,o){function r(i,s){if(!n[i]){if(!t[i]){var p="function"==typeof require&&require;if(!s&&p)return p(i,!0);if(a)return a(i,!0);var u=new Error("Cannot find module '"+i+"'");throw u.code="MODULE_NOT_FOUND",u}var l=n[i]={exports:{}};t[i][0].call(l.exports,function(e){var n=t[i][1][e];return r(n?n:e)},l,l.exports,e,t,n,o)}return n[i].exports}for(var a="function"==typeof require&&require,i=0;i<o.length;i++)r(o[i]);return r}({1:[function(e,t,n){var o=e("./listeners.js");t.exports=function(e,t){function n(t){return parseInt(e[t])}function r(t){return e[t].toFixed(3)}function a(e){return r(e+".r")+","+r(e+".g")+","+r(e+".b")+","+r(e+".a")}function i(t){return["mousemovex","mousemovey"].indexOf(e[t+".input"])>=0}function s(e,t){return t.map(function(t){return Array(e+1).join("	")+t})}function p(e,t){var n=e.pop(),o=/^\s*/.exec(n)[0];t.forEach(function(t,r){0==r?e.push(n+t):e.push(o+t)})}function u(){return lines=[],["x","y","z"].forEach(function(t){var n=t.toUpperCase(),o="rotate."+t,r="rotate"+n;e.needsUniform(o)&&lines.push("uniform float "+r+";")}),e.needsTransform("rotate.x")||e.needsTransform("rotate.y")||!e.needsTransform("rotate.z")?lines.push("attribute vec4 position;"):lines.push("attribute vec2 position;"),"vertex"==e.shader&&lines.push("attribute vec4 color;","varying vec4 interpolatedColor;"),lines.push("void main() {"),["x","y","z"].forEach(function(t){var n=t.toUpperCase(),o="rotate."+t,a="rotate"+n;e.needsTransform(o)&&(e.needsUniform("rotate."+t)?lines.push("	float c"+t+"=cos(radians("+a+"));","	float s"+t+"=sin(radians("+a+"));"):lines.push("	float c"+t+"=cos(radians("+r(o)+"));","	float s"+t+"=sin(radians("+r(o)+"));"))}),e.needsTransform("rotate.x")||e.needsTransform("rotate.y")||!e.needsTransform("rotate.z")?(lines.push("	gl_Position="),e.needsTransform("rotate.z")&&p(lines,["mat4(","	 cz,  sz, 0.0, 0.0,","	-sz,  cz, 0.0, 0.0,","	0.0, 0.0, 1.0, 0.0,","	0.0, 0.0, 0.0, 1.0",")*"]),e.needsTransform("rotate.y")&&p(lines,["mat4(","	 cy, 0.0, -sy, 0.0,","	0.0, 1.0, 0.0, 0.0,","	 sy, 0.0,  cy, 0.0,","	0.0, 0.0, 0.0, 1.0",")*"]),e.needsTransform("rotate.x")&&p(lines,["mat4(","	1.0, 0.0, 0.0, 0.0,","	0.0,  cx,  sx, 0.0,","	0.0, -sx,  cx, 0.0,","	0.0, 0.0, 0.0, 1.0",")*"]),p(lines,["position;"])):lines.push("	gl_Position=vec4(mat2(","		 cz, sz,","		-sz, cz","	)*position,0,1);"),"vertex"==e.shader&&lines.push("	interpolatedColor=color;"),lines.push("}"),lines}function l(){return"vertex"==e.shader?["varying vec4 interpolatedColor;","void main() {","	gl_FragColor=interpolatedColor;","}"]:e.hasInputsFor("shader.single.color")?["uniform vec4 color;","void main() {","	gl_FragColor=color;","}"]:["void main() {","	gl_FragColor=vec4("+a("shader.single.color")+");","}"]}function c(){function n(n){n.filter(function(e){return i(e.name)}).forEach(function(n){o.push("	<li>"+t("controls.type."+e[n.name+".input"])+" "+t("controls.to")+" <strong>"+t("options."+n.name)+"</strong></li>")})}var o=[];return n(e.inputOptions),n(e.transformOptions),o.length?["<ul>"].concat(o,["</ul>"]):[]}function h(){function o(o){o.filter(function(t){return"slider"==e[t.name+".input"]}).forEach(function(e){a.push("<div>","	<label for='"+e.name+"'>"+t("options."+e.name)+":</label>","	<span class='min'>"+e.getMinLabel()+"</span> "+(1==e.getStep()?"<input type='range' id='"+e.name+"' min='"+e.getMin()+"' max='"+e.getMax()+"' value='"+n(e.name)+"' />":"<input type='range' id='"+e.name+"' min='"+e.getMin()+"' max='"+e.getMax()+"' step='"+e.getStep()+"' value='"+r(e.name)+"' />")+" <span class='max'>"+e.getMaxLabel()+"</span>","</div>")})}var a=[];return o(e.inputOptions),o(e.transformOptions),a}function d(){return lines=["function makeProgram(vertexShaderSrc,fragmentShaderSrc) {","	var vertexShader=gl.createShader(gl.VERTEX_SHADER);","	gl.shaderSource(vertexShader,vertexShaderSrc);","	gl.compileShader(vertexShader);"],e.debugShader&&lines.push("	if (!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vertexShader));"),lines.push("	var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);","	gl.shaderSource(fragmentShader,fragmentShaderSrc);","	gl.compileShader(fragmentShader);"),e.debugShader&&lines.push("	if (!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fragmentShader));"),lines.push("	var program=gl.createProgram();","	gl.attachShader(program,vertexShader);","	gl.attachShader(program,fragmentShader);","	gl.linkProgram(program);","	return program;","}"),lines}function g(){function t(){return["var nVertices=4;","var vertices=new Float32Array([","	// x    y"+(a?"    r    g    b":""),"	-0.5,-0.5,"+(a?" 1.0, 0.0, 0.0,":""),"	+0.5,-0.5,"+(a?" 0.0, 1.0, 0.0,":""),"	+0.5,+0.5,"+(a?" 0.0, 0.0, 1.0,":""),"	-0.5,+0.5,"+(a?" 1.0, 1.0, 0.0,":""),"]);"]}function o(){return["var nVertices=3;","var vertices=new Float32Array([","	//                   x                      y"+(a?"    r    g    b":""),"	-Math.sin(0/3*Math.PI), Math.cos(0/3*Math.PI),"+(a?" 1.0, 0.0, 0.0,":""),"	-Math.sin(2/3*Math.PI), Math.cos(2/3*Math.PI),"+(a?" 0.0, 1.0, 0.0,":""),"	-Math.sin(4/3*Math.PI), Math.cos(4/3*Math.PI),"+(a?" 0.0, 0.0, 1.0,":""),"]);"]}function r(){return lines=[],"constant"!=e["shape.gasket.depth.input"]?lines.push("var gasketMaxDepth=10;","var nMaxVertices=Math.pow(3,gasketMaxDepth)*3;","var vertices=new Float32Array(nMaxVertices*"+(a?5:2)+");","var gasketDepth,nVertices;","function storeGasketVertices(newGasketDepth) {","	gasketDepth=newGasketDepth","	nVertices=Math.pow(3,gasketDepth)*3;"):lines.push("var gasketDepth="+n("shape.gasket.depth")+";","var nVertices=Math.pow(3,gasketDepth)*3;","var vertices=new Float32Array(nVertices*"+(a?5:2)+");","function storeGasketVertices() {"),lines.push("	var iv=0;"),a?lines.push("	function pushVertex(v,r,g,b) {","		vertices[iv++]=v[0]; vertices[iv++]=v[1];","		vertices[iv++]=r; vertices[iv++]=g; vertices[iv++]=b;","	}"):lines.push("	function pushVertex(v) {","		vertices[iv++]=v[0]; vertices[iv++]=v[1];","	}"),lines.push("	function mix(a,b,m) {","		return [","			a[0]*(1-m)+b[0]*m,","			a[1]*(1-m)+b[1]*m,","		];","	}","	function triangle(depth,a,b,c) {","		if (depth<=0) {"),a?lines.push("			pushVertex(a,1.0,0.0,0.0);","			pushVertex(b,0.0,1.0,0.0);","			pushVertex(c,0.0,0.0,1.0);"):lines.push("			pushVertex(a);","			pushVertex(b);","			pushVertex(c);"),lines.push("		} else {","			var ab=mix(a,b,0.5);","			var bc=mix(b,c,0.5);","			var ca=mix(c,a,0.5);","			triangle(depth-1,a,ab,ca);","			triangle(depth-1,b,bc,ab);","			triangle(depth-1,c,ca,bc);","		}","	}","	triangle(","		gasketDepth,","		[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],","		[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],","		[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]","	);","}"),"constant"!=e["shape.gasket.depth.input"]?lines.push("storeGasketVertices("+n("shape.gasket.depth")+");"):lines.push("storeGasketVertices();"),lines}var a="vertex"==e.shader;return"square"==e.shape?t():"triangle"==e.shape?o():"gasket"==e.shape?r():void 0}function f(){var t=["var buffer=gl.createBuffer();","gl.bindBuffer(gl.ARRAY_BUFFER,buffer);","gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);","","var positionLoc=gl.getAttribLocation(program,'position');"];return"vertex"==e.shader?t.push("gl.vertexAttribPointer(","	positionLoc,2,gl.FLOAT,false,","	Float32Array.BYTES_PER_ELEMENT*5,","	Float32Array.BYTES_PER_ELEMENT*0",");","gl.enableVertexAttribArray(positionLoc);","","var colorLoc=gl.getAttribLocation(program,'color');","gl.vertexAttribPointer(","	colorLoc,3,gl.FLOAT,false,","	Float32Array.BYTES_PER_ELEMENT*5,","	Float32Array.BYTES_PER_ELEMENT*2",");","gl.enableVertexAttribArray(colorLoc);"):t.push("gl.vertexAttribPointer(positionLoc,2,gl.FLOAT,false,0,0);","gl.enableVertexAttribArray(positionLoc);"),t}function m(){function t(t){c=c.concat(t.write(!e.isAnimated(),e.debugInputs))}function n(e,t,n){["r","g","b","a"].forEach(function(t){var o=e+"."+t;i(o)&&c.push("var "+n+t.toUpperCase()+"="+r(o)+";")})}function a(t,n,o,a,s,p,u){c.push("function "+n+"() {"),e.hasAllSliderInputsFor(t)?c.push("	"+a+"['r','g','b','a'].map(function(c){","		return parseFloat(document.getElementById('"+t+".'+c).value);","	})"+s):c.push("	"+p+["r","g","b","a"].map(function(n){var a=t+"."+n;return"slider"==e[a+".input"]?"parseFloat(document.getElementById('"+a+"').value)":i(a)?o+n.toUpperCase():r(a)}).join()+u),c.push("}",n+"();")}function s(n,r,a){var i,s=e.getOnlyInputFor(n);i=null===s?new o.MultipleSliderListener('[id^="'+n+'."]'):new o.SliderListener(s.name),i.enter().log("console.log(this.id,'input value:',parseFloat(this.value));").post(r+"();"),t(i)}function p(n,r,a){["r","g","b","a"].forEach(function(s){var p=n+"."+s,u=a+s.toUpperCase();if("slider"==e[p+".input"]){var l=new o.SliderListener(p);l.enter().log("console.log(this.id,'input value:',parseFloat(this.value));").post(r+"();"),t(l)}else i(p)&&h.enter().prexy(e[p+".input"],u+"=(ev.clientX-rect.left)/(rect.width-1);",u+"=(rect.bottom-1-ev.clientY)/(rect.height-1);").log("console.log('"+p+" input value:',"+u+");").post(r+"();")})}function u(t,n,o){var r=["r","g","b","a"].every(function(n){var o=e[t+"."+n+".input"];return"constant"==o||"slider"==o});r?s(t,n,o):p(t,n,o)}function l(e,t,o,r,i,s,p){n(e,t,o),a(e,t,o,r,i,s,p),u(e,t,o)}var c=[],h=new o.CanvasMousemoveListener;if(e.hasInputsFor("background.solid.color")&&l("background.solid.color","updateClearColor","clearColor","gl.clearColor.apply(gl,",");","gl.clearColor(",");"),e.hasInputsFor("shader.single.color")&&(c.push("var colorLoc=gl.getUniformLocation(program,'color');"),l("shader.single.color","updateColor","color","gl.uniform4fv(colorLoc,",");","gl.uniform4fv(colorLoc,[","]);")),"slider"==e["shape.gasket.depth.input"]){var d=new o.SliderListener("shape.gasket.depth");d.enter().log("console.log(this.id,'input value:',parseInt(this.value));").post("storeGasketVertices(parseInt(this.value));").post("gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);"),t(d)}else i("shape.gasket.depth")&&h.enter().prexy(e["shape.gasket.depth.input"],"var newGasketDepth=Math.floor((gasketMaxDepth+1)*(ev.clientX-rect.left)/rect.width);","var newGasketDepth=Math.floor((gasketMaxDepth+1)*(rect.bottom-1-ev.clientY)/rect.height);").cond("newGasketDepth!=gasketDepth").log("console.log('shape.gasket.depth input value:',newGasketDepth);").post("storeGasketVertices(newGasketDepth);").post("gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);");return["x","y","z"].forEach(function(n){var a=n.toUpperCase(),s="rotate."+n,p="rotate"+a,u="updateRotate"+a;if("slider"==e[s+".input"]){var l=new o.SliderListener(s),d=l.enter().log("console.log(this.id,'input value:',parseFloat(this.value));");0==e[s+".speed"]&&"constant"==e[s+".speed.input"]&&(c.push("var "+p+"Loc=gl.getUniformLocation(program,'"+p+"');","function "+u+"() {","	gl.uniform1f("+p+"Loc,parseFloat(document.getElementById('"+s+"').value));","};",u+"();"),d.post(u+"();")),t(l)}else i(s)&&(0==e[s+".speed"]&&"constant"==e[s+".speed.input"]?(c.push("var "+p+"Loc=gl.getUniformLocation(program,'"+p+"');","gl.uniform1f("+p+"Loc,"+r(s)+");"),h.enter().prexy(e[s+".input"],"var "+p+"=180*(-1+2*(ev.clientX-rect.left)/(rect.width-1));","var "+p+"=180*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));").log("console.log('"+s+" input value:',"+p+");").post("gl.uniform1f("+p+"Loc,"+p+");")):h.enter().state("var "+p+"="+r(s)+";").prexy(e[s+".input"],p+"=180*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",p+"=180*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));").log("console.log('"+s+" input value:',"+p+");"));if("slider"==e[s+".speed.input"]){var l=new o.SliderListener(s+".speed");l.enter().log("console.log(this.id,'input value:',parseFloat(this.value));"),t(l)}else i(s+".speed")&&h.enter().state("var "+p+"Speed="+r(s+".speed")+";").prexy(e[s+".speed.input"],p+"Speed=360*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",p+"Speed=360*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));").log("console.log('"+s+".speed input value:',"+p+"Speed);")}),t(h),c.length&&c.push("	"),c}function v(){function t(){function t(){var t=[];return["x","y","z"].forEach(function(i){var s=i.toUpperCase(),p="rotate."+i,u="rotate"+s;(0!=e[p+".speed"]||"constant"!=e[p+".speed.input"])&&("constant"==e[p+".speed.input"]&&"constant"==e[p+".input"]?(n=!0,t.push("var "+u+"="+(e[p]?r(p)+"+":"")+r(p+".speed")+"*(time-startTime)/1000;")):(o=!0,"slider"==e[p+".input"]&&t.push("var "+u+"Input=document.getElementById('"+p+"');","var "+u+"=parseFloat("+u+"Input.value);"),"slider"==e[p+".speed.input"]&&t.push("var "+u+"SpeedInput=document.getElementById('"+p+".speed');","var "+u+"Speed=parseFloat("+u+"SpeedInput.value);"),t.push(u+"+="+("constant"==e[p+".speed.input"]?r(p+".speed"):u+"Speed")+"*(time-prevTime)/1000;"),"slider"==e[p+".input"]&&(a=!0,t.push(u+"=wrap("+u+",180);",u+"Input.value="+u+";"))),t.push("gl.uniform1f("+u+"Loc,"+u+");"))}),t}var a=!1,i=t(),s=[];return a&&s.push("function wrap(v,maxAbsV) {","	v%=maxAbsV*2;","	if (Math.abs(v)<=maxAbsV) return v;","	return v-(v>0?1:-1)*maxAbsV*2;","}"),"solid"==e.background&&s.push("gl.clear(gl.COLOR_BUFFER_BIT);"),s=s.concat(i),"square"==e.shape?s.push("gl.drawArrays(gl.TRIANGLE_FAN,0,nVertices);"):s.push("gl.drawArrays(gl.TRIANGLES,0,nVertices);"),s}var n=!1,o=!1,a=[],p=t();e.isAnimated()&&(["x","y","z"].forEach(function(t){var n=t.toUpperCase(),o="rotate."+t,s="rotate"+n;e.needsUniform(o)&&("slider"!=e[o+".input"]&&!i(o)||0!=e[o+".speed"]||"constant"!=e[o+".speed.input"])&&a.push("var "+s+"Loc=gl.getUniformLocation(program,'"+s+"');"),"constant"!=e[o+".speed.input"]&&"constant"==e[o+".input"]&&a.push("var "+s+"="+r(o)+";")}),n&&o?a.push("var startTime=performance.now();","var prevTime=startTime;"):n?a.push("var startTime=performance.now();"):o&&a.push("var prevTime=performance.now();"));var u=e.isAnimated()||e.hasInputs();return u?(a.push("function updateCanvas(time) {"),a=a.concat(s(1,p)),e.isAnimated()&&(o&&a.push("	prevTime=time;"),a.push("	requestAnimationFrame(updateCanvas);")),a.push("}"),e.isAnimated()?a.push("requestAnimationFrame(updateCanvas);"):a.push("updateCanvas();")):a=a.concat(p),a}return[].concat(["<!DOCTYPE html>","<html lang='en'>","<head>","<meta charset='utf-8' />","<title>Generated code</title>"],e.hasSliderInputs()?["<style>","	label {","		display: inline-block;","		width: 15em;","		text-align: right;","	}","	.min {","		display: inline-block;","		width: 3em;","		text-align: right;","	}","	.max {","		display: inline-block;","		width: 3em;","		text-align: left;","	}","</style>"]:[],["<script id='myVertexShader' type='x-shader/x-vertex'>"],s(1,u()),["</script>","<script id='myFragmentShader' type='x-shader/x-fragment'>","	precision mediump float;"],s(1,l()),["</script>","</head>","<body>","<div>","	<canvas id='myCanvas' width='512' height='512'></canvas>","</div>"],c(),h(),["<script>"],s(1,d()),["	","	var canvas=document.getElementById('myCanvas');","	var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');"],"solid"!=e.background||e.hasInputsFor("background.solid.color")?[]:["	gl.clearColor("+a("background.solid.color")+");"],["	var program=makeProgram(","		document.getElementById('myVertexShader').text,","		document.getElementById('myFragmentShader').text","	);","	gl.useProgram(program);","	"],s(1,g()),["	"],s(1,f()),["	"],s(1,m()),s(1,v()),["</script>","</body>","</html>"]).join("\n")}},{"./listeners.js":2}],2:[function(e,t,n){var o=function(){this.entries=[]};o.prototype.enter=function(){function e(e){return function(){for(var t=0;t<arguments.length;t++)e.push(arguments[t]);return n}}var t={state:[],pre:[],cond:null,log:[],post:[]};this.entries.push(t);var n={state:e(t.state),pre:e(t.pre),cond:function(e){return t.cond=e,n},log:e(t.log),post:e(t.post)};return n},o.prototype.innerPrependedLines=function(){return[]},o.prototype.bracketFnArg=function(){return""},o.prototype.wrapCall=function(e){return e},o.prototype.write=function(e,t){function n(e){return"	"+e}function o(e,t){var n;n=e in s?s[e]:s[e]={prevs:[],conds:[],mark:l},null!==n.conds&&(null===t?n.conds=null:n.conds.push(t)),null!==u&&n.prevs.push(u),u=e}function r(){null!==u&&p.push(u),u=null}function a(){function e(e,t){var o=null;null!==t.conds&&(o=t.conds.join(" || ")),o!=a&&(null!==a&&r.push("}"),a=o,null!==a&&r.push("if ("+a+") {")),null!==a?r.push(n(e)):r.push(e)}function t(t,n){n.mark=c,o(n.prevs),n.mark=h,e(t,n)}function o(e){e.forEach(function(e){s[e].mark==l&&t(e,s[e])})}var r=[],a=null;return o(p),null!==a&&r.push("}"),r}var i=[],s={},p=[],u=null,l=0,c=1,h=2;this.entries.forEach(function(n){i=i.concat(n.state),n.pre.forEach(function(e){o(e,null)}),t&&n.log.forEach(function(e){o(e,n.cond)}),n.post.forEach(function(e){o(e,n.cond)}),e&&o("updateCanvas();",n.cond),r()});var d=this.bracketListener(),g=a();if(g.length&&(g=this.innerPrependedLines().concat(g)),1==g.length){var f=/^(\w+)\(\);$/.exec(g[0]);if(f)return i.concat(this.wrapCall([d[0]+f[1]+d[1]]))}return g.length?i.concat(this.wrapCall([].concat([d[0]+"function("+this.bracketFnArg()+"){"],g.map(n),["}"+d[1]]))):i};var r=function(e){o.call(this),this.id=e};r.prototype=Object.create(o.prototype),r.prototype.constructor=r,r.prototype.bracketListener=function(){return["document.getElementById('"+this.id+"').addEventListener('change',",");"]};var a=function(e){o.call(this),this.query=e};a.prototype=Object.create(o.prototype),a.prototype.constructor=a,a.prototype.wrapCall=function(e){return[].concat(["[].forEach.call(document.querySelectorAll('"+this.query+"'),function(el){"],e.map(function(e){return"	"+e}),["});"])},a.prototype.bracketListener=function(){return["el.addEventListener('change',",");"]};var i=function(){o.call(this)};i.prototype=Object.create(o.prototype),i.prototype.constructor=i,i.prototype.enter=function(){var e=o.prototype.enter.call(this);return e.prexy=function(t,n,o){return"mousemovex"==t?e.pre(n):"mousemovey"==t?e.pre(o):e},e},i.prototype.bracketListener=function(){return["canvas.addEventListener('mousemove',",");"]},i.prototype.bracketFnArg=function(){return"ev"},i.prototype.innerPrependedLines=function(){return["var rect=this.getBoundingClientRect();"]},n.SliderListener=r,n.MultipleSliderListener=a,n.CanvasMousemoveListener=i},{}],3:[function(e,t,n){function o(){return"webgl-starter-id-"+a++}function r(e){return"data:text/html;charset=utf-8,"+encodeURIComponent(e)}var a=0,i=e("./options.js"),s=e("./code.js"),p=function(e){return{"message.hljs":"<a href='https://highlightjs.org/'>highlight.js</a> (hosted on cdnjs.cloudflare.com) is not loaded. Syntax highlighting is disabled.","options.general":"General options","options.background":"Background","options.background.none":"None (transparent)","options.background.solid":"Solid color","options.shader":"Shader","options.shader.single":"Single color","options.shader.vertex":"One color per vertex","options.shape":"Shape to draw","options.shape.square":"Square","options.shape.triangle":"Triangle","options.shape.gasket":"Sierpinski gasket","options.input":"Input options","options.background.solid.color.r":"Background color red component","options.background.solid.color.g":"Background color green component","options.background.solid.color.b":"Background color blue component","options.background.solid.color.a":"Background color alpha component","options.shader.single.color.r":"Fragment color red component","options.shader.single.color.g":"Fragment color green component","options.shader.single.color.b":"Fragment color blue component","options.shader.single.color.a":"Fragment color alpha component","options.shape.gasket.depth":"Sierpinski gasket recursion depth","options.animation.rotation.speed":"Z axis rotation speed","options.*.input":"This value is","options.*.input.constant":"kept constant","options.*.input.slider":"updated with a slider","options.*.input.mousemovex":"updated by moving the mouse horizontally","options.*.input.mousemovey":"updated by moving the mouse vertically","options.*.input.animated":"animated","options.transform":"Transforms","options.rotate.x":"Angle of rotation around x axis","options.rotate.x.speed":"Speed of rotation around x axis","options.rotate.y":"Angle of rotation around y axis","options.rotate.y.speed":"Speed of rotation around y axis","options.rotate.z":"Angle of rotation around z axis","options.rotate.z.speed":"Speed of rotation around z axis","options.debug":"Debug options","options.debugShader":"Log shader compilation errors","options.debugInputs":"Log input values","controls.type.mousemovex":"Move the mouse pointer horizontally over the canvas","controls.type.mousemovey":"Move the mouse pointer vertically over the canvas","controls.to":"to update"}[e]};$(function(){$(".webgl-starter").each(function(){function e(e,t){d.find("[data-option^='"+e+".']").show().not("[data-option^='"+e+"."+t+".']").hide()}function t(){g.text(s(m.cloneWithoutHidden(),p)),window.hljs&&hljs.highlightBlock(g[0])}function n(n){var r=o();return $("<div>").append("<label for='"+r+"'>"+p("options."+n.name)+":</label>").append(" ").append($("<select id='"+r+"'>").append(n.availableValues.map(function(e){return $("<option>").val(e).html(p("options."+n.name+"."+e))})).val(m[n.name]).change(function(){m[n.name]=this.value,e(n.name,this.value),t()}))}function a(e){var n,r=o(),a=o();return $("<div data-option='"+e.name+"'>").append("<label for='"+r+"'>"+p("options."+e.name)+":</label>").append(" <span class='min'>"+e.getMinLabel()+"</span> ").append(n=$("<input type='range' id='"+r+"'>").attr("min",e.getMin()).attr("max",e.getMax()).attr("step",e.getStep()).val(m[e.name]).change(function(){m[e.name]=parseFloat(this.value),t()})).append(" <span class='max'>"+e.getMaxLabel()+"</span> ").append($("<button type='button'>Reset</button>").click(function(){n.val(e.defaultValue).change()})).append(" ").append("<label for='"+a+"'>"+p("options.*.input")+"</label> ").append($("<select id='"+a+"'>").append(e.availableInputTypes.map(function(e){return $("<option>").val(e).html(p("options.*.input."+e))})).val(m[e.name+".input"]).change(function(){m[e.name+".input"]=this.value,t()}))}function u(e){var n=o();return $("<div>").append($("<input type='checkbox' id='"+n+"'>").prop("checked",m[e.name]).change(function(){m[e.name]=$(this).prop("checked"),t()})).append(" <label for='"+n+"'>"+p("options."+e.name)+"</label>")}function l(){return $("<div>").append($("<fieldset>").append("<legend>"+p("options.general")+"</legend>").append(m.generalOptions.map(n))).append($("<fieldset>").append("<legend>"+p("options.input")+"</legend>").append(m.inputOptions.map(a))).append($("<fieldset>").append("<legend>"+p("options.transform")+"</legend>").append(m.transformOptions.map(a))).append($("<fieldset>").append("<legend>"+p("options.debug")+"</legend>").append(m.debugOptions.map(u)))}function c(){m.generalOptions.forEach(function(t){e(t.name,m[t.name])})}function h(){return $("<div>").append($("<a download='source.html'><button type='button'>Save source code</button></a>").click(function(){$(this).attr("href",r(g.text()))})).append(" ").append($("<button type='button'>Run in new window</button>").click(function(){window.open(r(g.text()),"generatedCode")})).append(" these buttons don't work in Internet Explorer, copy-paste the code manually")}var d,g,f=$(this),m=new i;f.empty().append(d=l()),c(),f.append(h()).append($("<pre>").append(g=$("<code>").text(s(m.cloneWithoutHidden(),p)))),window.hljs?hljs.highlightBlock(g[0]):f.append("<p>"+p("message.hljs")+"</p>"),f.append(h())})})},{"./code.js":1,"./options.js":4}],4:[function(e,t,n){var o=function(e,t,n){this.name=e,this.availableValues=t,void 0===n?this.defaultValue=t[0]:this.defaultValue=n};o.prototype.doesValueHideOption=function(e,t){function n(e){return 0===t.name.indexOf(e)}return n(this.name+".")&&!n(this.name+"."+e+".")};var r=function(e,t,n){o.call(this,e,t,n)};r.prototype=Object.create(o.prototype),r.prototype.constructor=r,r.prototype.availableInputTypes=["constant","slider","mousemovex","mousemovey"],r.prototype.getMin=function(){return this.availableValues[0]},r.prototype.getMax=function(){return this.availableValues[1]},r.prototype.getStep=function(){return this.availableValues.length>=3?this.availableValues[2]:"any"},r.prototype.getMinLabel=function(){return this.getMin().toString().replace("-","−")},r.prototype.getMaxLabel=function(){return this.getMax().toString().replace("-","−")};var a=function(e,t){o.call(this,e,[!1,!0],t)};a.prototype=Object.create(o.prototype),a.prototype.constructor=a;var i=function(){this.reset()};i.prototype.generalOptions=[new o("background",["none","solid"]),new o("shader",["single","vertex"]),new o("shape",["square","triangle","gasket"])],i.prototype.inputOptions=[new r("background.solid.color.r",[0,1],1),new r("background.solid.color.g",[0,1],1),new r("background.solid.color.b",[0,1],1),new r("background.solid.color.a",[0,1],1),new r("shader.single.color.r",[0,1],1),new r("shader.single.color.g",[0,1]),new r("shader.single.color.b",[0,1]),new r("shader.single.color.a",[0,1],1),new r("shape.gasket.depth",[0,10,1],6)],i.prototype.transformOptions=[new r("rotate.x",[-180,180],0),new r("rotate.x.speed",[-360,360],0),new r("rotate.y",[-180,180],0),new r("rotate.y.speed",[-360,360],0),new r("rotate.z",[-180,180],0),new r("rotate.z.speed",[-360,360],0)],i.prototype.debugOptions=[new a("debugShader",!0),new a("debugInputs")],i.prototype.reset=function(){this.generalOptions.forEach(function(e){this[e.name]=e.defaultValue},this),this.inputOptions.forEach(function(e){this[e.name]=e.defaultValue,this[e.name+".input"]="constant"},this),this.transformOptions.forEach(function(e){this[e.name]=e.defaultValue,this[e.name+".input"]="constant"},this),this.debugOptions.forEach(function(e){this[e.name]=e.defaultValue},this)},i.prototype.hasInputs=function(){return this.inputOptions.some(function(e){return"constant"!=this[e.name+".input"]},this)||this.transformOptions.some(function(e){return"constant"!=this[e.name+".input"]},this)},i.prototype.hasSliderInputs=function(){return this.inputOptions.some(function(e){return"slider"==this[e.name+".input"]},this)||this.transformOptions.some(function(e){return"slider"==this[e.name+".input"]},this)},i.prototype.hasInputsFor=function(e){return this.inputOptions.filter(function(t){return 0===t.name.indexOf(e+".")},this).some(function(e){return"constant"!=this[e.name+".input"]},this)},i.prototype.hasAllSliderInputsFor=function(e){return this.inputOptions.filter(function(t){return 0===t.name.indexOf(e+".")},this).every(function(e){return"slider"==this[e.name+".input"]},this)},i.prototype.getOnlyInputFor=function(e){var t=this.inputOptions.filter(function(t){return 0===t.name.indexOf(e+".")&&"constant"!=this[t.name+".input"]},this);return 1==t.length?t[0]:null},i.prototype.isAnimated=function(){function e(e,t){return-1!==e.indexOf(t,e.length-t.length)}return this.transformOptions.some(function(t){return e(t.name,".speed")&&(0!=this[t.name]||"constant"!=this[t.name+".input"])},this)},i.prototype.needsUniform=function(e){return"constant"!=this[e+".input"]||0!=this[e+".speed"]||"constant"!=this[e+".speed.input"]},i.prototype.needsTransform=function(e){return this.needsUniform(e)||0!=this[e]},i.prototype.cloneWithoutHidden=function(){var e=new i;return this.generalOptions.forEach(function(t){e[t.name]=this[t.name]},this),[this.inputOptions,this.transformOptions].forEach(function(t){t.forEach(function(t){e[t.name]=this[t.name],this.generalOptions.some(function(e){return e.doesValueHideOption(this[e.name],t)},this)?e[t.name+".input"]="constant":e[t.name+".input"]=this[t.name+".input"]},this)},this),this.debugOptions.forEach(function(t){e[t.name]=this[t.name]},this),e},t.exports=i},{}]},{},[3]);
//# sourceMappingURL=index.js.map