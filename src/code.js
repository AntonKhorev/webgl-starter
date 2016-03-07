'use strict'

const Shape=require('./shape-classes')
const FeatureContext=require('./feature-context')
const Canvas=require('./canvas')
const Background=require('./background')
const Transforms=require('./transforms')
const Illumination=require('./illumination')

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const InterleaveLines=require('crnx-base/interleave-lines')
const IndentLines=require('crnx-base/indent-lines')
const BaseWebCode=require('crnx-base/web-code')

class Code extends BaseWebCode {
	constructor(options,i18n) {
		super()
		this.options=options
		this.i18n=i18n
		this.featureContext=new FeatureContext(options.debug)
		this.canvas=new Canvas(options.canvas)
		this.background=new Background(options.background)
		this.transforms=new Transforms(options.transforms)
		this.illumination=new Illumination(options.material,options.light)
		const makeShape=()=>{
			return new Shape[String(options.shape.type)](
				options.shape,
				options.light.type!='off',
				options.material.scope=='vertex',
				options.material.scope=='face',
				this.illumination.getColorAttrs()
			)
		}
		this.shape=makeShape()
		this.features=[
			this.canvas,
			this.background,
			this.transforms,
			this.illumination,
			this.shape,
		]
		this.featureNames=[
			'canvas',
			'background',
			'transforms',
			'illumination',
			'shape',
		]
		this.features.forEach(feature=>{
			feature.requestFeatureContext(this.featureContext)
		})
	}
	get basename() {
		return 'webgl'
	}
	get lang() {
		return 'en'
	}
	get title() {
		return "WebGL example - Generated code"
	}
	get styleLines() {
		const a=Lines.b()
		if (this.featureContext.hasSliders) {
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
			)
		}
		return a.e()
	}
	get headLines() {
		const getVertexShaderLines=()=>{
			const needTransformedPosition=this.illumination.wantsTransformedPosition(this.transforms.eyeAtInfinity)
			return Lines.bae(
				this.canvas.getGlslVertexDeclarationLines(),
				this.transforms.getGlslVertexDeclarationLines(this.shape.dim==2),
				this.illumination.getGlslVertexDeclarationLines(this.transforms.eyeAtInfinity,this.shape.dim>2),
				WrapLines.b(
					"void main() {",
					"}"
				).ae(
					this.canvas.getGlslVertexOutputLines(),
					this.transforms.getGlslVertexOutputLines(this.shape.dim==2,this.canvas.providesAspect(),needTransformedPosition),
					this.illumination.getGlslVertexOutputLines(this.transforms.eyeAtInfinity,this.shape.hasNormals,this.transforms.getGlslVertexNormalTransformLines())
				)
			)
		}
		const getFragmentShaderLines=()=>{
			return Lines.bae(
				"precision mediump float;",
				this.illumination.getGlslFragmentDeclarationLines(this.transforms.eyeAtInfinity),
				WrapLines.b(
					"void main() {",
					"}"
				).ae(
					this.illumination.getGlslFragmentOutputLines(this.transforms.eyeAtInfinity,this.shape.twoSided)
				)
			)
		}
		return Lines.bae(
			WrapLines.b(
				"<script id=myVertexShader type=x-shader/x-vertex>",
				"</script>"
			).ae(
				getVertexShaderLines()
			),
			WrapLines.b(
				"<script id=myFragmentShader type=x-shader/x-fragment>",
				"</script>"
			).ae(
				getFragmentShaderLines()
			)
		)
	}
	get bodyLines() {
		return Lines.bae(
			this.canvas.getHtmlCanvasLines(),
			NoseWrapLines.b(
				"<ul>",
				"</ul>"
			).ae(
				...this.features.map(feature=>feature.getHtmlControlMessageLines(this.i18n))
			),
			...this.features.map(feature=>feature.getHtmlInputLines(this.i18n))
		)
	}
	get scriptLines() {
		const getMakeProgramLines=()=>{
			const a=JsLines.b()
			a(
				"var vertexShader=gl.createShader(gl.VERTEX_SHADER);",
				"gl.shaderSource(vertexShader,vertexShaderSrc);",
				"gl.compileShader(vertexShader);"
			)
			if (this.options.debugShaders) {
				a("if (!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vertexShader));")
			}
			a(
				"var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);",
				"gl.shaderSource(fragmentShader,fragmentShaderSrc);",
				"gl.compileShader(fragmentShader);"
			)
			if (this.options.debugShaders) {
				a("if (!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fragmentShader));")
			}
			a(
				"var program=gl.createProgram();",
				"gl.attachShader(program,vertexShader);",
				"gl.attachShader(program,fragmentShader);",
				"gl.linkProgram(program);",
				"return program;"
			)
			return a.e()
		}
		const getJsInitLines=()=>{
			const a=JsLines.b()
			a(
				WrapLines.b(
					JsLines.bae("function makeProgram(vertexShaderSrc,fragmentShaderSrc) {"),
					JsLines.bae("}")
				).ae(
					getMakeProgramLines()
				),
				"var canvas=document.getElementById('myCanvas');",
				"var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');",
				"var program=makeProgram(",
				"	document.getElementById('myVertexShader').text,",
				"	document.getElementById('myFragmentShader').text",
				");",
				"gl.useProgram(program);"
			)
			const addWithCommentIfNotEmpty=(featureLines,comment)=>{
				if (featureLines.count()>0) {
					a(
						"",
						"// "+comment, // TODO i18n
						featureLines
					)
				}
			}
			this.features.forEach((feature,i)=>{
				addWithCommentIfNotEmpty(
					feature.getJsInitLines(this.featureContext),
					"init "+this.featureNames[i]
				)
			})
			addWithCommentIfNotEmpty(
				this.featureContext.getJsAfterInitLines(),
				"init mousemove listener"
			)
			return a.e()
		}
		const getJsInnerLoopLines=()=>{
			const a=JsLines.b()
			if (this.featureContext.hasClampFn) {
				a(
					"function clamp(v,min,max) {",
					"	return Math.min(Math.max(v,min),max);",
					"}"
				)
			}
			if (this.featureContext.hasWrapFn) {
				a(
					"function wrap(v,maxAbs) {",
					"	v%=maxAbs*2;",
					"	if (Math.abs(v)<=maxAbs) return v;",
					"	return v-(v>0?1:-1)*maxAbs*2;",
					"}"
				)
			}
			if (this.featureContext.pollsGamepad) {
				a(
					"var gamepad;",
					"var gamepads=(navigator.getGamepads ? navigator.getGamepads() : []);",
					"for (var i=0;i<gamepads.length;i++) {",
					"	if (gamepads[i]) {",
					"		gamepad=gamepads[i];",
					"		break;",
					"	}",
					"}"
				)
			}
			a(
				...this.features.map(feature=>feature.getJsLoopLines(this.featureContext))
			)
			return a.e()
		}
		const getJsLoopLines=()=>{
			const a=JsLines.b()
			if (this.featureContext.hasStartTime && this.featureContext.hasPrevTime) {
				a("var startTime=performance.now();")
				a("var prevTime=startTime;")
			} else if (this.featureContext.hasStartTime) {
				a("var startTime=performance.now();")
			} else if (this.featureContext.hasPrevTime) {
				a("var prevTime=performance.now();")
			}
			// wrap inner render lines in function if needed
			if (this.featureContext.isAnimated) {
				if (this.featureContext.hasTime) {
					a("function renderFrame(time) {")
				} else {
					a("function renderFrame() {")
				}
				a(IndentLines.bae(getJsInnerLoopLines()))
				if (this.featureContext.hasPrevTime) {
					a("	prevTime=time;")
				}
				a(
					"	requestAnimationFrame(renderFrame);",
					"}",
					"requestAnimationFrame(renderFrame);"
				)
			} else if (this.featureContext.hasInputs) {
				a(
					"var frameId=null;",
					"function renderFrame() {",
					IndentLines.bae(getJsInnerLoopLines()),
					"	frameId=null;",
					"}",
					"function scheduleFrame() {",
					"	if (frameId===null) {",
					"		frameId=requestAnimationFrame(renderFrame);",
					"	}",
					"}",
					"scheduleFrame();"
				)
			} else {
				a(getJsInnerLoopLines())
			}
			return a.e()
		}
		return InterleaveLines.bae(
			getJsInitLines(),
			getJsLoopLines()
		)
	}
}

module.exports=Code