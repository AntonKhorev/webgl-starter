!function e(t,n,o){function r(i,s){if(!n[i]){if(!t[i]){var p="function"==typeof require&&require;if(!s&&p)return p(i,!0);if(a)return a(i,!0);var c=new Error("Cannot find module '"+i+"'");throw c.code="MODULE_NOT_FOUND",c}var u=n[i]={exports:{}};t[i][0].call(u.exports,function(e){var n=t[i][1][e];return r(n?n:e)},u,u.exports,e,t,n,o)}return n[i].exports}for(var a="function"==typeof require&&require,i=0;i<o.length;i++)r(o[i]);return r}({1:[function(e,t,n){var o=e("./listeners.js"),r=e("./shapes.js");t.exports=function(e,t){function n(t){return parseInt(e[t])}function a(t){return e[t].toFixed(3)}function i(e){return a(e+".r")+","+a(e+".g")+","+a(e+".b")+","+a(e+".a")}function s(e){var t=a(e+".r"),n=a(e+".g"),o=a(e+".b"),r=a(e+".a");return t==r&&n==r&&o==r?r:t+","+n+","+o+","+r}function p(t){return["mousemovex","mousemovey"].indexOf(e[t+".input"])>=0}function c(e,t){return t.map(function(t){return Array(e+1).join("	")+t})}function u(e,t){var n=e.pop(),o=/^\s*/.exec(n)[0];t.forEach(function(t,r){0==r?e.push(n+t):e.push(o+t)})}function l(){return"square"==e.shape?new r.Square(e.shader):"triangle"==e.shape?new r.Triangle(e.shader):"gasket"==e.shape?new r.Gasket(e.shader,n("shape.gasket.depth"),"constant"!=e["shape.gasket.depth.input"]):"cube"==e.shape?new r.Cube(e.shader):void 0}function h(){var t=2==b.dim&&!e.needsTransform("rotate.x")&&!e.needsTransform("rotate.y")&&e.needsTransform("rotate.z"),n=[];return["x","y","z"].forEach(function(t){var o=t.toUpperCase(),r="rotate."+t,a="rotate"+o;e.needsUniform(r)&&n.push("uniform float "+a+";")}),t?n.push("attribute vec2 position;"):n.push("attribute vec4 position;"),("vertex"==e.shader||"face"==e.shader)&&n.push("attribute vec4 color;","varying vec4 interpolatedColor;"),n.push("void main() {"),["x","y","z"].forEach(function(t){var o=t.toUpperCase(),r="rotate."+t,i="rotate"+o;e.needsTransform(r)&&(e.needsUniform("rotate."+t)?n.push("	float c"+t+"=cos(radians("+i+"));","	float s"+t+"=sin(radians("+i+"));"):n.push("	float c"+t+"=cos(radians("+a(r)+"));","	float s"+t+"=sin(radians("+a(r)+"));"))}),t?n.push("	gl_Position=vec4(mat2(","		 cz, sz,","		-sz, cz","	)*position,0,1);"):(n.push("	gl_Position="),e.needsTransform("rotate.z")&&u(n,["mat4(","	 cz,  sz, 0.0, 0.0,","	-sz,  cz, 0.0, 0.0,","	0.0, 0.0, 1.0, 0.0,","	0.0, 0.0, 0.0, 1.0",")*"]),e.needsTransform("rotate.y")&&u(n,["mat4(","	 cy, 0.0, -sy, 0.0,","	0.0, 1.0, 0.0, 0.0,","	 sy, 0.0,  cy, 0.0,","	0.0, 0.0, 0.0, 1.0",")*"]),e.needsTransform("rotate.x")&&u(n,["mat4(","	1.0, 0.0, 0.0, 0.0,","	0.0,  cx,  sx, 0.0,","	0.0, -sx,  cx, 0.0,","	0.0, 0.0, 0.0, 1.0",")*"]),u(n,["position;"])),("vertex"==e.shader||"face"==e.shader)&&n.push("	interpolatedColor=color;"),n.push("}"),n}function d(){return"vertex"==e.shader||"face"==e.shader?["varying vec4 interpolatedColor;","void main() {","	gl_FragColor=interpolatedColor;","}"]:e.hasInputsFor("shader.single.color")?["uniform vec4 color;","void main() {","	gl_FragColor=color;","}"]:["void main() {","	gl_FragColor=vec4("+s("shader.single.color")+");","}"]}function g(){function n(n){n.filter(function(e){return p(e.name)}).forEach(function(n){o.push("	<li>"+t("controls.type."+e[n.name+".input"])+" "+t("controls.to")+" <strong>"+t("options."+n.name)+"</strong></li>")})}var o=[];return n(e.inputOptions),n(e.transformOptions),o.length?["<ul>"].concat(o,["</ul>"]):[]}function f(){function o(o){o.filter(function(t){return"slider"==e[t.name+".input"]}).forEach(function(e){r.push("<div>","	<label for='"+e.name+"'>"+t("options."+e.name)+":</label>","	<span class='min'>"+e.getMinLabel()+"</span> "+(1==e.getStep()?"<input type='range' id='"+e.name+"' min='"+e.getMin()+"' max='"+e.getMax()+"' value='"+n(e.name)+"' />":"<input type='range' id='"+e.name+"' min='"+e.getMin()+"' max='"+e.getMax()+"' step='"+e.getStep()+"' value='"+a(e.name)+"' />")+" <span class='max'>"+e.getMaxLabel()+"</span>","</div>")})}var r=[];return o(e.inputOptions),o(e.transformOptions),r}function m(){return lines=["function makeProgram(vertexShaderSrc,fragmentShaderSrc) {","	var vertexShader=gl.createShader(gl.VERTEX_SHADER);","	gl.shaderSource(vertexShader,vertexShaderSrc);","	gl.compileShader(vertexShader);"],e.debugShader&&lines.push("	if (!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vertexShader));"),lines.push("	var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);","	gl.shaderSource(fragmentShader,fragmentShaderSrc);","	gl.compileShader(fragmentShader);"),e.debugShader&&lines.push("	if (!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fragmentShader));"),lines.push("	var program=gl.createProgram();","	gl.attachShader(program,vertexShader);","	gl.attachShader(program,fragmentShader);","	gl.linkProgram(program);","	return program;","}"),lines}function v(){function t(t){l=l.concat(t.write(!e.isAnimated(),e.debugInputs))}function n(e,t,n){["r","g","b","a"].forEach(function(t){var o=e+"."+t;p(o)&&l.push("var "+n+t.toUpperCase()+"="+a(o)+";")})}function r(t,n,o,r,i,s,c){l.push("function "+n+"() {"),e.hasAllSliderInputsFor(t)?l.push("	"+r+"['r','g','b','a'].map(function(c){","		return parseFloat(document.getElementById('"+t+".'+c).value);","	})"+i):l.push("	"+s+["r","g","b","a"].map(function(n){var r=t+"."+n;return"slider"==e[r+".input"]?"parseFloat(document.getElementById('"+r+"').value)":p(r)?o+n.toUpperCase():a(r)}).join()+c),l.push("}",n+"();")}function i(n,r,a){var i,s=e.getOnlyInputFor(n);i=null===s?new o.MultipleSliderListener('[id^="'+n+'."]'):new o.SliderListener(s.name),i.enter().log("console.log(this.id,'input value:',parseFloat(this.value));").post(r+"();"),t(i)}function s(n,r,a){["r","g","b","a"].forEach(function(i){var s=n+"."+i,c=a+i.toUpperCase();if("slider"==e[s+".input"]){var u=new o.SliderListener(s);u.enter().log("console.log(this.id,'input value:',parseFloat(this.value));").post(r+"();"),t(u)}else p(s)&&h.enter().prexy(e[s+".input"],c+"=(ev.clientX-rect.left)/(rect.width-1);",c+"=(rect.bottom-1-ev.clientY)/(rect.height-1);").log("console.log('"+s+" input value:',"+c+");").post(r+"();")})}function c(t,n,o){var r=["r","g","b","a"].every(function(n){var o=e[t+"."+n+".input"];return"constant"==o||"slider"==o});r?i(t,n,o):s(t,n,o)}function u(e,t,o,a,i,s,p){n(e,t,o),r(e,t,o,a,i,s,p),c(e,t,o)}var l=[],h=new o.CanvasMousemoveListener;if(e.hasInputsFor("background.solid.color")&&u("background.solid.color","updateClearColor","clearColor","gl.clearColor.apply(gl,",");","gl.clearColor(",");"),e.hasInputsFor("shader.single.color")&&(l.push("var colorLoc=gl.getUniformLocation(program,'color');"),u("shader.single.color","updateColor","color","gl.uniform4fv(colorLoc,",");","gl.uniform4fv(colorLoc,[","]);")),"slider"==e["shape.gasket.depth.input"]){var d=new o.SliderListener("shape.gasket.depth");d.enter().log("console.log(this.id,'input value:',parseInt(this.value));").post("storeGasketVertices(parseInt(this.value));").post("gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);"),t(d)}else p("shape.gasket.depth")&&h.enter().prexy(e["shape.gasket.depth.input"],"var newGasketDepth=Math.floor((gasketMaxDepth+1)*(ev.clientX-rect.left)/rect.width);","var newGasketDepth=Math.floor((gasketMaxDepth+1)*(rect.bottom-1-ev.clientY)/rect.height);").cond("newGasketDepth!=gasketDepth").log("console.log('shape.gasket.depth input value:',newGasketDepth);").post("storeGasketVertices(newGasketDepth);").post("gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);");return["x","y","z"].forEach(function(n){var r=n.toUpperCase(),i="rotate."+n,s="rotate"+r,c="updateRotate"+r;if("slider"==e[i+".input"]){var u=new o.SliderListener(i),d=u.enter().log("console.log(this.id,'input value:',parseFloat(this.value));");0==e[i+".speed"]&&"constant"==e[i+".speed.input"]&&(l.push("var "+s+"Loc=gl.getUniformLocation(program,'"+s+"');","function "+c+"() {","	gl.uniform1f("+s+"Loc,parseFloat(document.getElementById('"+i+"').value));","};",c+"();"),d.post(c+"();")),t(u)}else p(i)&&(0==e[i+".speed"]&&"constant"==e[i+".speed.input"]?(l.push("var "+s+"Loc=gl.getUniformLocation(program,'"+s+"');","gl.uniform1f("+s+"Loc,"+a(i)+");"),h.enter().prexy(e[i+".input"],"var "+s+"=180*(-1+2*(ev.clientX-rect.left)/(rect.width-1));","var "+s+"=180*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));").log("console.log('"+i+" input value:',"+s+");").post("gl.uniform1f("+s+"Loc,"+s+");")):h.enter().state("var "+s+"="+a(i)+";").prexy(e[i+".input"],s+"=180*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",s+"=180*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));").log("console.log('"+i+" input value:',"+s+");"));if("slider"==e[i+".speed.input"]){var u=new o.SliderListener(i+".speed");u.enter().log("console.log(this.id,'input value:',parseFloat(this.value));"),t(u)}else p(i+".speed")&&h.enter().state("var "+s+"Speed="+a(i+".speed")+";").prexy(e[i+".speed.input"],s+"Speed=360*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",s+"Speed=360*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));").log("console.log('"+i+".speed input value:',"+s+"Speed);")}),t(h),l.length&&l.push("	"),l}function y(){function t(){function t(){var t=[];return["x","y","z"].forEach(function(i){var s=i.toUpperCase(),p="rotate."+i,c="rotate"+s;(0!=e[p+".speed"]||"constant"!=e[p+".speed.input"])&&("constant"==e[p+".speed.input"]&&"constant"==e[p+".input"]?(n=!0,t.push("var "+c+"="+(e[p]?a(p)+"+":"")+a(p+".speed")+"*(time-startTime)/1000;")):(o=!0,"slider"==e[p+".input"]&&t.push("var "+c+"Input=document.getElementById('"+p+"');","var "+c+"=parseFloat("+c+"Input.value);"),"slider"==e[p+".speed.input"]&&t.push("var "+c+"SpeedInput=document.getElementById('"+p+".speed');","var "+c+"Speed=parseFloat("+c+"SpeedInput.value);"),t.push(c+"+="+("constant"==e[p+".speed.input"]?a(p+".speed"):c+"Speed")+"*(time-prevTime)/1000;"),"slider"==e[p+".input"]&&(r=!0,t.push(c+"=wrap("+c+",180);",c+"Input.value="+c+";"))),t.push("gl.uniform1f("+c+"Loc,"+c+");"))}),t}var r=!1,i=t(),s=[];return r&&s.push("function wrap(v,maxAbsV) {","	v%=maxAbsV*2;","	if (Math.abs(v)<=maxAbsV) return v;","	return v-(v>0?1:-1)*maxAbsV*2;","}"),"solid"==e.background&&s.push("gl.clear(gl.COLOR_BUFFER_BIT);"),s=s.concat(i,b.writeDraw())}var n=!1,o=!1,r=[],i=t();e.isAnimated()&&(["x","y","z"].forEach(function(t){var n=t.toUpperCase(),o="rotate."+t,i="rotate"+n;e.needsUniform(o)&&("slider"!=e[o+".input"]&&!p(o)||0!=e[o+".speed"]||"constant"!=e[o+".speed.input"])&&r.push("var "+i+"Loc=gl.getUniformLocation(program,'"+i+"');"),"constant"!=e[o+".speed.input"]&&"constant"==e[o+".input"]&&r.push("var "+i+"="+a(o)+";")}),n&&o?r.push("var startTime=performance.now();","var prevTime=startTime;"):n?r.push("var startTime=performance.now();"):o&&r.push("var prevTime=performance.now();"));var s=e.isAnimated()||e.hasInputs();return s?(r.push("function updateCanvas(time) {"),r=r.concat(c(1,i)),e.isAnimated()&&(o&&r.push("	prevTime=time;"),r.push("	requestAnimationFrame(updateCanvas);")),r.push("}"),e.isAnimated()?r.push("requestAnimationFrame(updateCanvas);"):r.push("updateCanvas();")):r=r.concat(i),r}var b=l();return[].concat(["<!DOCTYPE html>","<html lang='en'>","<head>","<meta charset='utf-8' />","<title>Generated code</title>"],e.hasSliderInputs()?["<style>","	label {","		display: inline-block;","		width: 15em;","		text-align: right;","	}","	.min {","		display: inline-block;","		width: 3em;","		text-align: right;","	}","	.max {","		display: inline-block;","		width: 3em;","		text-align: left;","	}","</style>"]:[],["<script id='myVertexShader' type='x-shader/x-vertex'>"],c(1,h()),["</script>","<script id='myFragmentShader' type='x-shader/x-fragment'>","	precision mediump float;"],c(1,d()),["</script>","</head>","<body>","<div>","	<canvas id='myCanvas' width='512' height='512'></canvas>","</div>"],g(),f(),["<script>"],c(1,m()),["	","	var canvas=document.getElementById('myCanvas');","	var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');"],"solid"!=e.background||e.hasInputsFor("background.solid.color")||0==e["background.solid.color.r"]&&0==e["background.solid.color.g"]&&0==e["background.solid.color.b"]&&0==e["background.solid.color.a"]?[]:["	gl.clearColor("+i("background.solid.color")+");"],b.dim>2?["	gl.enable(gl.DEPTH_TEST);"]:[],["	var program=makeProgram(","		document.getElementById('myVertexShader').text,","		document.getElementById('myFragmentShader').text","	);","	gl.useProgram(program);","	"],c(1,b.writeInit()),["	"],c(1,v()),c(1,y()),["</script>","</body>","</html>"]).join("\n")}},{"./listeners.js":2,"./shapes.js":5}],2:[function(e,t,n){var o=function(){this.entries=[]};o.prototype.enter=function(){function e(e){return function(){for(var t=0;t<arguments.length;t++)e.push(arguments[t]);return n}}var t={state:[],pre:[],cond:null,log:[],post:[]};this.entries.push(t);var n={state:e(t.state),pre:e(t.pre),cond:function(e){return t.cond=e,n},log:e(t.log),post:e(t.post)};return n},o.prototype.innerPrependedLines=function(){return[]},o.prototype.bracketFnArg=function(){return""},o.prototype.wrapCall=function(e){return e},o.prototype.write=function(e,t){function n(e){return"	"+e}function o(e,t){var n;n=e in s?s[e]:s[e]={prevs:[],conds:[],mark:u},null!==n.conds&&(null===t?n.conds=null:n.conds.push(t)),null!==c&&n.prevs.push(c),c=e}function r(){null!==c&&p.push(c),c=null}function a(){function e(e,t){var o=null;null!==t.conds&&(o=t.conds.join(" || ")),o!=a&&(null!==a&&r.push("}"),a=o,null!==a&&r.push("if ("+a+") {")),null!==a?r.push(n(e)):r.push(e)}function t(t,n){n.mark=l,o(n.prevs),n.mark=h,e(t,n)}function o(e){e.forEach(function(e){s[e].mark==u&&t(e,s[e])})}var r=[],a=null;return o(p),null!==a&&r.push("}"),r}var i=[],s={},p=[],c=null,u=0,l=1,h=2;this.entries.forEach(function(n){i=i.concat(n.state),n.pre.forEach(function(e){o(e,null)}),t&&n.log.forEach(function(e){o(e,n.cond)}),n.post.forEach(function(e){o(e,n.cond)}),e&&o("updateCanvas();",n.cond),r()});var d=this.bracketListener(),g=a();if(g.length&&(g=this.innerPrependedLines().concat(g)),1==g.length){var f=/^(\w+)\(\);$/.exec(g[0]);if(f)return i.concat(this.wrapCall([d[0]+f[1]+d[1]]))}return g.length?i.concat(this.wrapCall([].concat([d[0]+"function("+this.bracketFnArg()+"){"],g.map(n),["}"+d[1]]))):i};var r=function(e){o.call(this),this.id=e};r.prototype=Object.create(o.prototype),r.prototype.constructor=r,r.prototype.bracketListener=function(){return["document.getElementById('"+this.id+"').addEventListener('change',",");"]};var a=function(e){o.call(this),this.query=e};a.prototype=Object.create(o.prototype),a.prototype.constructor=a,a.prototype.wrapCall=function(e){return[].concat(["[].forEach.call(document.querySelectorAll('"+this.query+"'),function(el){"],e.map(function(e){return"	"+e}),["});"])},a.prototype.bracketListener=function(){return["el.addEventListener('change',",");"]};var i=function(){o.call(this)};i.prototype=Object.create(o.prototype),i.prototype.constructor=i,i.prototype.enter=function(){var e=o.prototype.enter.call(this);return e.prexy=function(t,n,o){return"mousemovex"==t?e.pre(n):"mousemovey"==t?e.pre(o):e},e},i.prototype.bracketListener=function(){return["canvas.addEventListener('mousemove',",");"]},i.prototype.bracketFnArg=function(){return"ev"},i.prototype.innerPrependedLines=function(){return["var rect=this.getBoundingClientRect();"]},n.SliderListener=r,n.MultipleSliderListener=a,n.CanvasMousemoveListener=i},{}],3:[function(e,t,n){function o(){return"webgl-starter-id-"+a++}function r(e){return"data:text/html;charset=utf-8,"+encodeURIComponent(e)}var a=0,i=e("./options.js"),s=e("./code.js"),p=function(e){return{"message.hljs":"<a href='https://highlightjs.org/'>highlight.js</a> (hosted on cdnjs.cloudflare.com) is not loaded. Syntax highlighting is disabled.","options.general":"General options","options.background":"Background","options.background.none":"None (transparent)","options.background.solid":"Solid color","options.shader":"Shader","options.shader.single":"Single color","options.shader.vertex":"One color per vertex","options.shader.face":"One color per face","options.shape":"Shape to draw","options.shape.square":"Square","options.shape.triangle":"Triangle","options.shape.gasket":"Sierpinski gasket","options.shape.cube":"Cube","options.input":"Input options","options.background.solid.color.r":"Background color red component","options.background.solid.color.g":"Background color green component","options.background.solid.color.b":"Background color blue component","options.background.solid.color.a":"Background color alpha component","options.shader.single.color.r":"Fragment color red component","options.shader.single.color.g":"Fragment color green component","options.shader.single.color.b":"Fragment color blue component","options.shader.single.color.a":"Fragment color alpha component","options.shape.gasket.depth":"Sierpinski gasket recursion depth","options.animation.rotation.speed":"Z axis rotation speed","options.*.input":"This value is","options.*.input.constant":"kept constant","options.*.input.slider":"updated with a slider","options.*.input.mousemovex":"updated by moving the mouse horizontally","options.*.input.mousemovey":"updated by moving the mouse vertically","options.*.input.animated":"animated","options.transform":"Transforms","options.rotate.x":"Angle of rotation around x axis","options.rotate.x.speed":"Speed of rotation around x axis","options.rotate.y":"Angle of rotation around y axis","options.rotate.y.speed":"Speed of rotation around y axis","options.rotate.z":"Angle of rotation around z axis","options.rotate.z.speed":"Speed of rotation around z axis","options.debug":"Debug options","options.debugShader":"Log shader compilation errors","options.debugInputs":"Log input values","controls.type.mousemovex":"Move the mouse pointer horizontally over the canvas","controls.type.mousemovey":"Move the mouse pointer vertically over the canvas","controls.to":"to update"}[e]};$(function(){$(".webgl-starter").each(function(){function e(e,t){d.find("[data-option^='"+e+".']").show().not("[data-option^='"+e+"."+t+".']").hide()}function t(){clearTimeout(v),v=setTimeout(function(){g.text(s(m.cloneWithoutHidden(),p)),window.hljs&&hljs.highlightBlock(g[0])},y)}function n(n){var r=o();return $("<div>").append("<label for='"+r+"'>"+p("options."+n.name)+":</label>").append(" ").append($("<select id='"+r+"'>").append(n.availableValues.map(function(e){return $("<option>").val(e).html(p("options."+n.name+"."+e))})).val(m[n.name]).change(function(){m[n.name]=this.value,e(n.name,this.value),t()}))}function a(e){function n(n){this.checkValidity()&&(n.val(this.value),m[e.name]=parseFloat(this.value),t())}var r,a,i=o(),s=o();return $("<div data-option='"+e.name+"'>").append("<label for='"+i+"'>"+p("options."+e.name)+":</label>").append(" <span class='min'>"+e.getMinLabel()+"</span> ").append(r=$("<input type='range' id='"+i+"'>").attr("min",e.getMin()).attr("max",e.getMax()).attr("step",e.getSetupStep()).val(m[e.name]).on("input change",function(){n.call(this,a)})).append(" <span class='max'>"+e.getMaxLabel()+"</span> ").append(a=$("<input type='number' required>").attr("min",e.getMin()).attr("max",e.getMax()).attr("step",e.getSetupStep()).val(m[e.name]).on("input change",function(){n.call(this,r)})).append(" ").append($("<button type='button'>Reset</button>").click(function(){r.val(e.defaultValue).change()})).append(" ").append("<label for='"+s+"'>"+p("options.*.input")+"</label> ").append($("<select id='"+s+"'>").append(e.availableInputTypes.map(function(e){return $("<option>").val(e).html(p("options.*.input."+e))})).val(m[e.name+".input"]).change(function(){m[e.name+".input"]=this.value,t()}))}function c(e){var n=o();return $("<div>").append($("<input type='checkbox' id='"+n+"'>").prop("checked",m[e.name]).change(function(){m[e.name]=$(this).prop("checked"),t()})).append(" <label for='"+n+"'>"+p("options."+e.name)+"</label>")}function u(){return $("<div>").append($("<fieldset>").append("<legend>"+p("options.general")+"</legend>").append(m.generalOptions.map(n))).append($("<fieldset>").append("<legend>"+p("options.input")+"</legend>").append(m.inputOptions.map(a))).append($("<fieldset>").append("<legend>"+p("options.transform")+"</legend>").append(m.transformOptions.map(a))).append($("<fieldset>").append("<legend>"+p("options.debug")+"</legend>").append(m.debugOptions.map(c)))}function l(){m.generalOptions.forEach(function(t){e(t.name,m[t.name])})}function h(){return $("<div>").append($("<a download='source.html'><button type='button'>Save source code</button></a>").click(function(){$(this).attr("href",r(g.text()))})).append(" ").append($("<button type='button'>Run in new window</button>").click(function(){window.open(r(g.text()),"generatedCode")})).append(" these buttons don't work in Internet Explorer, copy-paste the code manually")}var d,g,f=$(this),m=new i,v=null,y=200;f.empty().append(d=u()),l(),f.append(h()).append($("<pre>").append(g=$("<code>").text(s(m.cloneWithoutHidden(),p)))),window.hljs?hljs.highlightBlock(g[0]):f.append("<p>"+p("message.hljs")+"</p>"),f.append(h())})})},{"./code.js":1,"./options.js":4}],4:[function(e,t,n){var o=function(e,t,n){this.name=e,this.availableValues=t,void 0===n?this.defaultValue=t[0]:this.defaultValue=n};o.prototype.doesValueHideOption=function(e,t){function n(e){return 0===t.name.indexOf(e)}return n(this.name+".")&&!n(this.name+"."+e+".")};var r=function(e,t,n){o.call(this,e,t,n)};r.prototype=Object.create(o.prototype),r.prototype.constructor=r,r.prototype.availableInputTypes=["constant","slider","mousemovex","mousemovey"],r.prototype.getMin=function(){return this.availableValues[0]},r.prototype.getMax=function(){return this.availableValues[1]},r.prototype.getMinLabel=function(){return this.getMin().toString().replace("-","−")},r.prototype.getMaxLabel=function(){return this.getMax().toString().replace("-","−")};var a=function(e,t,n){r.call(this,e,t,n)};a.prototype=Object.create(r.prototype),a.prototype.constructor=a,a.prototype.getStep=function(){return"any"},a.prototype.getSetupStep=function(){return this.getMax()>=100?"0.1":this.getMax()>=10?"0.01":"0.001"};var i=function(e,t,n){r.call(this,e,t,n)};i.prototype=Object.create(r.prototype),i.prototype.constructor=i,i.prototype.getStep=function(){return 1},i.prototype.getSetupStep=function(){return 1};var s=function(e,t){o.call(this,e,[!1,!0],t)};s.prototype=Object.create(o.prototype),s.prototype.constructor=s;var p=function(){this.reset()};p.prototype.generalOptions=[new o("background",["none","solid"]),new o("shader",["single","vertex","face"]),new o("shape",["square","triangle","gasket","cube"])],p.prototype.inputOptions=[new a("background.solid.color.r",[0,1],1),new a("background.solid.color.g",[0,1],1),new a("background.solid.color.b",[0,1],1),new a("background.solid.color.a",[0,1],1),new a("shader.single.color.r",[0,1],1),new a("shader.single.color.g",[0,1]),new a("shader.single.color.b",[0,1]),new a("shader.single.color.a",[0,1],1),new i("shape.gasket.depth",[0,10],6)],p.prototype.transformOptions=[new a("rotate.x",[-180,180],0),new a("rotate.x.speed",[-360,360],0),new a("rotate.y",[-180,180],0),new a("rotate.y.speed",[-360,360],0),new a("rotate.z",[-180,180],0),new a("rotate.z.speed",[-360,360],0)],p.prototype.debugOptions=[new s("debugShader",!0),new s("debugInputs")],p.prototype.reset=function(){this.generalOptions.forEach(function(e){this[e.name]=e.defaultValue},this),this.inputOptions.forEach(function(e){this[e.name]=e.defaultValue,this[e.name+".input"]="constant"},this),this.transformOptions.forEach(function(e){this[e.name]=e.defaultValue,this[e.name+".input"]="constant"},this),this.debugOptions.forEach(function(e){this[e.name]=e.defaultValue},this)},p.prototype.hasInputs=function(){return this.inputOptions.some(function(e){return"constant"!=this[e.name+".input"]},this)||this.transformOptions.some(function(e){return"constant"!=this[e.name+".input"]},this)},p.prototype.hasSliderInputs=function(){return this.inputOptions.some(function(e){return"slider"==this[e.name+".input"]},this)||this.transformOptions.some(function(e){return"slider"==this[e.name+".input"]},this)},p.prototype.hasInputsFor=function(e){return this.inputOptions.filter(function(t){return 0===t.name.indexOf(e+".")},this).some(function(e){return"constant"!=this[e.name+".input"]},this)},p.prototype.hasAllSliderInputsFor=function(e){return this.inputOptions.filter(function(t){return 0===t.name.indexOf(e+".")},this).every(function(e){return"slider"==this[e.name+".input"]},this)},p.prototype.getOnlyInputFor=function(e){var t=this.inputOptions.filter(function(t){return 0===t.name.indexOf(e+".")&&"constant"!=this[t.name+".input"]},this);return 1==t.length?t[0]:null},p.prototype.isAnimated=function(){function e(e,t){return-1!==e.indexOf(t,e.length-t.length)}return this.transformOptions.some(function(t){return e(t.name,".speed")&&(0!=this[t.name]||"constant"!=this[t.name+".input"])},this)},p.prototype.needsUniform=function(e){return"constant"!=this[e+".input"]||0!=this[e+".speed"]||"constant"!=this[e+".speed.input"]},p.prototype.needsTransform=function(e){return this.needsUniform(e)||0!=this[e]},p.prototype.cloneWithoutHidden=function(){var e=new p;return this.generalOptions.forEach(function(t){e[t.name]=this[t.name]},this),[this.inputOptions,this.transformOptions].forEach(function(t){t.forEach(function(t){e[t.name]=this[t.name],this.generalOptions.some(function(e){return e.doesValueHideOption(this[e.name],t)},this)?e[t.name+".input"]="constant":e[t.name+".input"]=this[t.name+".input"]},this)},this),this.debugOptions.forEach(function(t){e[t.name]=this[t.name]},this),e},t.exports=p},{}],5:[function(e,t,n){var o=function(e){this.shaderType=e};o.prototype.dim=2,o.prototype.usesElements=!1,o.prototype.glPrimitive="TRIANGLES",o.prototype.writeInit=function(){var e="vertex"==this.shaderType||"face"==this.shaderType,t="vertex"==this.shaderType,n=this.writeArrays(e,t);return n.push("","gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());","gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);",""),this.usesElements&&n.push("gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());","gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,elements,gl.STATIC_DRAW);",""),n.push("var positionLoc=gl.getAttribLocation(program,'position');"),e?n.push("gl.vertexAttribPointer(","	positionLoc,"+this.dim+",gl.FLOAT,false,","	Float32Array.BYTES_PER_ELEMENT*"+(this.dim+3)+",","	Float32Array.BYTES_PER_ELEMENT*0",");","gl.enableVertexAttribArray(positionLoc);","","var colorLoc=gl.getAttribLocation(program,'color');","gl.vertexAttribPointer(","	colorLoc,3,gl.FLOAT,false,","	Float32Array.BYTES_PER_ELEMENT*"+(this.dim+3)+",","	Float32Array.BYTES_PER_ELEMENT*"+this.dim,");","gl.enableVertexAttribArray(colorLoc);"):n.push("gl.vertexAttribPointer(positionLoc,"+this.dim+",gl.FLOAT,false,0,0);","gl.enableVertexAttribArray(positionLoc);"),n},o.prototype.writeDraw=function(){return this.usesElements?["gl.drawElements(gl."+this.glPrimitive+",nElements,gl.UNSIGNED_SHORT,0);"]:["gl.drawArrays(gl."+this.glPrimitive+",0,nVertices);"]};var r=function(e){o.call(this,e)};r.prototype=Object.create(o.prototype),r.prototype.constructor=r,r.prototype.glPrimitive="TRIANGLE_FAN",r.prototype.writeArrays=function(e,t){return["var nVertices=4;","var vertices=new Float32Array([","	// x    y"+(e?"    r    g    b":""),"	-0.5,-0.5,"+(e?" 1.0, 0.0, 0.0,":""),"	+0.5,-0.5,"+(e?t?" 0.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),"	+0.5,+0.5,"+(e?t?" 0.0, 0.0, 1.0,":" 1.0, 0.0, 0.0,":""),"	-0.5,+0.5,"+(e?t?" 1.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),"]);"]};var a=function(e){o.call(this,e)};a.prototype=Object.create(o.prototype),a.prototype.constructor=a,a.prototype.writeArrays=function(e,t){return["var nVertices=3;","var vertices=new Float32Array([","	//                   x                      y"+(e?"    r    g    b":""),"	-Math.sin(0/3*Math.PI), Math.cos(0/3*Math.PI),"+(e?" 1.0, 0.0, 0.0,":""),"	-Math.sin(2/3*Math.PI), Math.cos(2/3*Math.PI),"+(e?t?" 0.0, 1.0, 0.0,":" 1.0, 0.0, 0.0,":""),"	-Math.sin(4/3*Math.PI), Math.cos(4/3*Math.PI),"+(e?t?" 0.0, 0.0, 1.0,":" 1.0, 0.0, 0.0,":""),"]);"]};var i=function(e,t,n){o.call(this,e),this.depth=t,this.isDepthChanges=n};i.prototype=Object.create(o.prototype),i.prototype.constructor=i,i.prototype.writeArrays=function(e,t){return lines=[],this.isDepthChanges?lines.push("var gasketMaxDepth=10;","var nMaxVertices=Math.pow(3,gasketMaxDepth)*3;","var vertices=new Float32Array(nMaxVertices*"+(e?5:2)+");","var gasketDepth,nVertices;","function storeGasketVertices(newGasketDepth) {","	gasketDepth=newGasketDepth","	nVertices=Math.pow(3,gasketDepth)*3;"):lines.push("var gasketDepth="+this.depth+";","var nVertices=Math.pow(3,gasketDepth)*3;","var vertices=new Float32Array(nVertices*"+(e?5:2)+");","function storeGasketVertices() {"),lines.push("	var iv=0;"),"face"==this.shaderType&&lines.push("	var ic=0;","	var colors=[","		[1.0, 0.0, 0.0],","		[0.0, 1.0, 0.0],","		[0.0, 0.0, 1.0],","		[1.0, 1.0, 0.0],","	];"),"vertex"==this.shaderType?lines.push("	function pushVertex(v,r,g,b) {","		vertices[iv++]=v[0]; vertices[iv++]=v[1];","		vertices[iv++]=r; vertices[iv++]=g; vertices[iv++]=b;","	}"):"face"==this.shaderType?lines.push("	function pushVertex(v,c) {","		vertices[iv++]=v[0]; vertices[iv++]=v[1];","		vertices[iv++]=c[0]; vertices[iv++]=c[1]; vertices[iv++]=c[2];","	}"):lines.push("	function pushVertex(v) {","		vertices[iv++]=v[0]; vertices[iv++]=v[1];","	}"),lines.push("	function mix(a,b,m) {","		return [","			a[0]*(1-m)+b[0]*m,","			a[1]*(1-m)+b[1]*m,","		];","	}","	function triangle(depth,a,b,c) {","		if (depth<=0) {"),"vertex"==this.shaderType?lines.push("			pushVertex(a,1.0,0.0,0.0);","			pushVertex(b,0.0,1.0,0.0);","			pushVertex(c,0.0,0.0,1.0);"):"face"==this.shaderType?lines.push("			pushVertex(a,colors[ic]);","			pushVertex(b,colors[ic]);","			pushVertex(c,colors[ic]);","			ic=(ic+1)%colors.length;"):lines.push("			pushVertex(a);","			pushVertex(b);","			pushVertex(c);"),lines.push("		} else {","			var ab=mix(a,b,0.5);","			var bc=mix(b,c,0.5);","			var ca=mix(c,a,0.5);","			triangle(depth-1,a,ab,ca);","			triangle(depth-1,b,bc,ab);","			triangle(depth-1,c,ca,bc);","		}","	}","	triangle(","		gasketDepth,","		[-Math.sin(0/3*Math.PI),Math.cos(0/3*Math.PI)],","		[-Math.sin(2/3*Math.PI),Math.cos(2/3*Math.PI)],","		[-Math.sin(4/3*Math.PI),Math.cos(4/3*Math.PI)]","	);","}"),this.isDepthChanges?lines.push("storeGasketVertices("+this.depth+");"):lines.push("storeGasketVertices();"),lines};var s=function(e){o.call(this,e)};s.prototype=Object.create(o.prototype),s.prototype.constructor=s,s.prototype.dim=3,s.prototype.usesElements=!0,s.prototype.writeArrays=function(e,t){return"face"==this.shaderType?["var vertices=new Float32Array([","	// x    y    z    r    g    b","	-0.5,-0.5,-0.5, 1.0, 0.0, 0.0, // left face","	-0.5,-0.5,+0.5, 1.0, 0.0, 0.0,","	-0.5,+0.5,-0.5, 1.0, 0.0, 0.0,","	-0.5,+0.5,+0.5, 1.0, 0.0, 0.0,","	+0.5,-0.5,-0.5, 0.0, 1.0, 0.0, // right face","	+0.5,+0.5,-0.5, 0.0, 1.0, 0.0,","	+0.5,-0.5,+0.5, 0.0, 1.0, 0.0,","	+0.5,+0.5,+0.5, 0.0, 1.0, 0.0,","	-0.5,-0.5,-0.5, 1.0, 1.0, 0.0, // bottom face","	+0.5,-0.5,-0.5, 1.0, 1.0, 0.0,","	-0.5,-0.5,+0.5, 1.0, 1.0, 0.0,","	+0.5,-0.5,+0.5, 1.0, 1.0, 0.0,","	-0.5,+0.5,-0.5, 0.0, 0.0, 1.0, // top face","	-0.5,+0.5,+0.5, 0.0, 0.0, 1.0,","	+0.5,+0.5,-0.5, 0.0, 0.0, 1.0,","	+0.5,+0.5,+0.5, 0.0, 0.0, 1.0,","	-0.5,-0.5,-0.5, 1.0, 0.0, 1.0, // back face","	-0.5,+0.5,-0.5, 1.0, 0.0, 1.0,","	+0.5,-0.5,-0.5, 1.0, 0.0, 1.0,","	+0.5,+0.5,-0.5, 1.0, 0.0, 1.0,","	-0.5,-0.5,+0.5, 0.0, 1.0, 1.0, // front face","	+0.5,-0.5,+0.5, 0.0, 1.0, 1.0,","	-0.5,+0.5,+0.5, 0.0, 1.0, 1.0,","	+0.5,+0.5,+0.5, 0.0, 1.0, 1.0,","]);","var nElements=36;","var elements=new Uint16Array([","	 0,  1,  2,  2,  1,  3, // left face","	 4,  5,  6,  6,  5,  7, // right face","	 8,  9, 10, 10,  9, 11, // bottom face","	12, 13, 14, 14, 13, 15, // top face","	16, 17, 18, 18, 17, 19, // back face","	20, 21, 22, 22, 21, 23, // front face","]);"]:["var vertices=new Float32Array([","	// x    y    z"+(e?"    r    g    b":""),"	-0.5,-0.5,-0.5,"+(e?" 0.0, 0.0, 0.0,":""),"	+0.5,-0.5,-0.5,"+(e?" 1.0, 0.0, 0.0,":""),"	-0.5,+0.5,-0.5,"+(e?" 0.0, 1.0, 0.0,":""),"	+0.5,+0.5,-0.5,"+(e?" 1.0, 1.0, 0.0,":""),"	-0.5,-0.5,+0.5,"+(e?" 0.0, 0.0, 1.0,":""),"	+0.5,-0.5,+0.5,"+(e?" 1.0, 0.0, 1.0,":""),"	-0.5,+0.5,+0.5,"+(e?" 0.0, 1.0, 1.0,":""),"	+0.5,+0.5,+0.5,"+(e?" 1.0, 1.0, 1.0,":""),"]);","var nElements=36;","var elements=new Uint16Array([","	4, 6, 0, 0, 6, 2, // left face (in right-handed coords)","	1, 3, 5, 5, 3, 7, // right face","	0, 1, 4, 4, 1, 5, // bottom face","	2, 6, 3, 3, 6, 7, // top face","	0, 2, 1, 1, 2, 3, // back face","	5, 7, 4, 4, 7, 6, // front face","]);"];
},n.Square=r,n.Triangle=a,n.Gasket=i,n.Cube=s},{}]},{},[3]);
//# sourceMappingURL=index.js.map