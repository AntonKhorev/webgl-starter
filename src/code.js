'use strict';

const Lines=require('./lines.js');
const Shape=require('./shape-classes.js');
const FeatureContext=require('./feature-context.js');
const Canvas=require('./canvas.js');
const Background=require('./background.js');
const Transforms=require('./transforms.js');
const Illumination=require('./illumination.js');

module.exports=function(options,i18n){
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
	const featureNames=[
		'canvas',
		'background',
		'transforms',
		'illumination',
		'shape',
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
		const needTransformedPosition=illumination.wantsTransformedPosition(transforms.eyeAtInfinity);
		return new Lines(
			canvas.getGlslVertexDeclarationLines(),
			transforms.getGlslVertexDeclarationLines(shape.dim==2),
			illumination.getGlslVertexDeclarationLines(transforms.eyeAtInfinity,shape.dim>2),
			(new Lines(
				canvas.getGlslVertexOutputLines(),
				transforms.getGlslVertexOutputLines(shape.dim==2,canvas.providesAspect(),needTransformedPosition),
				illumination.getGlslVertexOutputLines(transforms.eyeAtInfinity,shape.hasNormals,transforms.getGlslVertexNormalTransformLines())
			)).wrap(
				"void main() {",
				"}"
			)
		);
	}
	function getFragmentShaderLines() {
		return new Lines(
			"precision mediump float;",
			illumination.getGlslFragmentDeclarationLines(transforms.eyeAtInfinity),
			illumination.getGlslFragmentOutputLines(transforms.eyeAtInfinity,shape.twoSided).wrap(
				"void main() {",
				"}"
			)
		);
	}
	function getHtmlControlMessageLines() {
		var lines=new Lines;
		features.forEach(feature=>{
			lines.a(feature.getHtmlControlMessageLines(i18n));
		});
		return lines.wrapIfNotEmpty(
			"<ul>",
			"</ul>"
		);
	}
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
		lines.a(
			"var program=makeProgram(",
			"	document.getElementById('myVertexShader').text,",
			"	document.getElementById('myFragmentShader').text",
			");",
			"gl.useProgram(program);"
		);
		const addWithCommentIfNotEmpty=(featureLines,comment)=>{
			if (featureLines.data.length>0) {
				lines.a(
					"",
					"// "+comment, // TODO i18n
					featureLines
				);
			}
		};
		features.forEach((feature,i)=>{
			addWithCommentIfNotEmpty(
				feature.getJsInitLines(featureContext),
				"init "+featureNames[i]
			);
		});
		addWithCommentIfNotEmpty(
			featureContext.getJsAfterInitLines(),
			"init mousemove listener"
		);
		return lines;
	}
	function getJsLoopLines() {
		const innerLines=new Lines;
		if (featureContext.hasClampFn) {
			innerLines.a(
				"function clamp(v,min,max) {",
				"	return Math.min(Math.max(v,min),max);",
				"}"
			);
		}
		if (featureContext.hasWrapFn) {
			innerLines.a(
				"function wrap(v,maxAbs) {",
				"	v%=maxAbs*2;",
				"	if (Math.abs(v)<=maxAbs) return v;",
				"	return v-(v>0?1:-1)*maxAbs*2;",
				"}"
			);
		}
		if (featureContext.pollsGamepad) {
			innerLines.a(
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
		features.forEach(feature=>{
			innerLines.a(feature.getJsLoopLines(featureContext));
		});
		var lines=new Lines;
		if (featureContext.hasStartTime && featureContext.hasPrevTime) {
			lines.a(
				"var startTime=performance.now();",
				"var prevTime=startTime;"
			);
		} else if (featureContext.hasStartTime) {
			lines.a(
				"var startTime=performance.now();"
			);
		} else if (featureContext.hasPrevTime) {
			lines.a(
				"var prevTime=performance.now();"
			);
		}
		// wrap inner render lines in function if needed
		if (featureContext.isAnimated) {
			if (featureContext.hasTime) {
				lines.a(
					"function renderFrame(time) {"
				);
			} else {
				lines.a(
					"function renderFrame() {"
				);
			}
			lines.a(
				innerLines.indent()
			);
			if (featureContext.hasPrevTime) {
				lines.a(
					"	prevTime=time;"
				);
			}
			lines.a(
				"	requestAnimationFrame(renderFrame);",
				"}",
				"requestAnimationFrame(renderFrame);"
			);
		} else if (featureContext.hasInputs) {
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
		getFragmentShaderLines().indent(),
		"</script>",
		"</head>",
		"<body>",
		canvas.getHtmlCanvasLines(),
		getHtmlControlMessageLines(),
		getHtmlInputLines(),
		scriptLines,
		"</body>",
		"</html>"
	);
	return lines.join(
		options.formatting.indent=='tab' ? '\t' : Array(parseInt(options.formatting.indent)+1).join(' ')
	);
};
