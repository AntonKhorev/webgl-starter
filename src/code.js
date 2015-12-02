var Lines=require('./lines.js');
var listeners=require('./listeners.js');
var shapes=require('./shapes.js');
var GlslVector=require('./glsl-vector.js');

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

	function makeShape() {
		var className=options.shape.charAt(0).toUpperCase()+options.shape.slice(1);
		var shapeParams=options.getInputOptionsFor('shape').map(function(option){
			return {
				value: intOptionValue(option.name),
				changes: options[option.name+'.input']!='constant',
				min: intOptionValue(option.name+'.min'),
				max: intOptionValue(option.name+'.max')
			};
		});
		var shapeCtorArgs=[null,parseInt(options.elements),options.shader].concat(shapeParams);
		return new (Function.prototype.bind.apply(shapes[className],shapeCtorArgs));
	}
	var shape=makeShape();
	if (options.shader=='single') {
		var colorVector=new GlslVector('color','shader.single.color','rgba',options);
	} else if (options.shader=='light') {
		var lightDirectionVector=new GlslVector('lightDirection','shader.light.direction','xyz',options);
	}

	function generateHtmlStyleLines() {
		var lines=new Lines;
		if (options.hasSliderInputs()) {
			lines.a(
				"label {",
				"	display: inline-block;",
				"	width: 15em;",
				"	text-align: right;",
				"}",
				".min {",
				"	display: inline-block;",
				"	width: 3em;",
				"	text-align: right;",
				"}",
				".max {",
				"	display: inline-block;",
				"	width: 3em;",
				"	text-align: left;",
				"}"
			);
		}
		return lines.wrapIfNotEmpty(
			"<style>",
			"</style>"
		);
	}
	function generateVertexShaderLines() {
		var use2dTransform=(
			shape.dim==2 &&
			!options.needsTransform('rotate.x') &&
			!options.needsTransform('rotate.y') &&
			 options.needsTransform('rotate.z')
		);
		var needAspectUniform=options.hasInputsFor('canvas');
		var needAspectConstant=!needAspectUniform && options['canvas.width']!=options['canvas.height'];
		var needTransformedPosition=options.shader=='light' && options.projection=='perspective';

		function generateMain() {
			var lines=new Lines();
			['x','y','z'].forEach(function(d){
				var D=d.toUpperCase();
				var optName='rotate.'+d;
				var varName='rotate'+D;
				if (options.needsTransform(optName)) {
					if (options.needsUniform('rotate.'+d)) {
						lines.a(
							"float c"+d+"=cos(radians("+varName+"));",
							"float s"+d+"=sin(radians("+varName+"));"
						);
					} else {
						lines.a(
							"float c"+d+"=cos(radians("+floatOptionValue(optName)+"));",
							"float s"+d+"=sin(radians("+floatOptionValue(optName)+"));"
						);
					}
				}
			});
			if (needAspectConstant) {
				lines.a(
					"float aspect="+intOptionValue('canvas.width')+".0/"+intOptionValue('canvas.height')+".0;"
				);
			}
			if (options.projection=='perspective') {
				lines.a(
					"float fovy=45.0;",
					"float near=1.0/tan(radians(fovy)/2.0);",
					"float far=near+2.0;"
				);
			}
			if (needTransformedPosition) {
				lines.a(
					"vec4 transformedPosition="
				);
			} else {
				lines.a(
					"gl_Position="
				);
			}
			if (use2dTransform) {
				lines.t(
					"vec4(position*mat2(",
					"	cz, -sz,",
					"	sz,  cz",
					"),0,1)"
				);
			} else {
				lines.t(
					"position"
				);
				options.transformOrder.forEach(function(transformName){
					if (!options.needsTransform(transformName)) {
						return;
					}
					lines.t({
						'rotate.x': [
							"*mat4(",
							"	1.0, 0.0, 0.0, 0.0,",
							"	0.0,  cx, -sx, 0.0,",
							"	0.0,  sx,  cx, 0.0,",
							"	0.0, 0.0, 0.0, 1.0",
							")"
						],
						'rotate.y': [
							"*mat4(",
							"	 cy, 0.0,  sy, 0.0,",
							"	0.0, 1.0, 0.0, 0.0,",
							"	-sy, 0.0,  cy, 0.0,",
							"	0.0, 0.0, 0.0, 1.0",
							")"
						],
						'rotate.z': [
							"*mat4(",
							"	 cz, -sz, 0.0, 0.0,",
							"	 sz,  cz, 0.0, 0.0,",
							"	0.0, 0.0, 1.0, 0.0,",
							"	0.0, 0.0, 0.0, 1.0",
							")"
						]
					}[transformName]);
				});
				if (options.projection=='perspective') {
					lines.t(
						"*mat4( // move center of coords inside view",
						"	1.0, 0.0, 0.0, 0.0,",
						"	0.0, 1.0, 0.0, 0.0,",
						"	0.0, 0.0, 1.0, -(near+far)/2.0,",
						"	0.0, 0.0, 0.0, 1.0",
						")"
					);
				}
			}
			if (needTransformedPosition) {
				lines.t(
					";"
				);
				lines.a(
					"gl_Position=transformedPosition"
				);
			}
			if (options.projection=='ortho') {
				if (needAspectUniform || needAspectConstant) {
					lines.t(
						"*vec4(1.0/aspect,1.0,-1.0,1.0)" // correct aspect ratio and make coords right-handed
					);
				} else if (shape.dim>2) {
					lines.t(
						"*vec4(1.0,1.0,-1.0,1.0)" // make coords right-handed for 3d shapes
					);
				}
			} else if (options.projection=='perspective') {
				if (needAspectUniform || needAspectConstant) {
					lines.t(
						"*mat4(",
						"	near/aspect, 0.0,  0.0,                   0.0,",
						"	0.0,         near, 0.0,                   0.0,",
						"	0.0,         0.0,  (near+far)/(near-far), 2.0*near*far/(near-far),",
						"	0.0,         0.0,  -1.0,                  0.0",
						")"
					);
				} else {
					lines.t(
						"*mat4(",
						"	near, 0.0,  0.0,                   0.0,",
						"	0.0,  near, 0.0,                   0.0,",
						"	0.0,  0.0,  (near+far)/(near-far), 2.0*near*far/(near-far),",
						"	0.0,  0.0,  -1.0,                  0.0",
						")"
					);
				}
			}
			lines.t(
				";"
			);
			if (options.shader=='light') {
				if (options.projection=='perspective') {
					lines.a(
						"interpolatedView=-vec3(transformedPosition);"
					);
				}
				if (shape.dim>2) {
					lines.a(
						"interpolatedNormal=normal"
					);
				} else {
					lines.a(
						"interpolatedNormal=vec3(0.0,0.0,1.0)"
					);
				}
				options.transformOrder.forEach(function(transformName){
					if (!options.needsTransform(transformName)) {
						return;
					}
					lines.t({
						'rotate.x': [
							"*mat3(",
							"	1.0, 0.0, 0.0,",
							"	0.0,  cx, -sx,",
							"	0.0,  sx,  cx",
							")"
						],
						'rotate.y': [
							"*mat3(",
							"	 cy, 0.0,  sy,",
							"	0.0, 1.0, 0.0,",
							"	-sy, 0.0,  cy",
							")"
						],
						'rotate.z': [
							"*mat3(",
							"	 cz, -sz, 0.0,",
							"	 sz,  cz, 0.0,",
							"	0.0, 0.0, 1.0",
							")"
						]
					}[transformName]);
				});
				lines.t(
					";"
				);
			}
			if (options.shader=='vertex' || options.shader=='face') {
				lines.a(
					"interpolatedColor=color;"
				);
			}
			return lines;
		}

		var lines=new Lines();
		if (needAspectUniform) {
			lines.a("uniform float aspect;");
		}
		['x','y','z'].forEach(function(d){
			var D=d.toUpperCase();
			var optName='rotate.'+d;
			var varName='rotate'+D;
			if (options.needsUniform(optName)) {
				lines.a("uniform float "+varName+";");
			}
		});
		if (use2dTransform) {
			lines.a("attribute vec2 position;");
		} else {
			lines.a("attribute vec4 position;");
		}
		if (options.shader=='light') {
			if (options.projection=='perspective') {
				lines.a("varying vec3 interpolatedView;");
			}
			if (shape.dim>2) {
				lines.a("attribute vec3 normal;");
			}
			lines.a("varying vec3 interpolatedNormal;");
		}
		if (options.shader=='vertex' || options.shader=='face') {
			lines.a(
				"attribute vec4 color;",
				"varying vec4 interpolatedColor;"
			);
		}
		lines.a(
			"void main() {",
			generateMain().indent(),
			"}"
		);
		return lines;
	}
	function generateFragmentShaderLines() {
		var lines=new Lines;
		lines.a(
			"precision mediump float;"
		);
		if (options.shader=='single') {
			lines.a(
				colorVector.getGlslDeclarationLines(),
				"void main() {",
				"	gl_FragColor="+colorVector.getGlslValue()+";",
				"}"
			);
		} else if (options.shader=='vertex' || options.shader=='face') {
			lines.a(
				"varying vec4 interpolatedColor;",
				"void main() {",
				"	gl_FragColor=interpolatedColor;",
				"}"
			);
		} else if (options.shader=='light') {
			lines.a(
				lightDirectionVector.getGlslDeclarationLines()
			);
			if (options.projection=='perspective') {
				lines.a(
					"varying vec3 interpolatedView;"
				);
			}
			lines.a(
				"varying vec3 interpolatedNormal;",
				"void main() {",
				"	vec3 ambientColor=vec3(0.2,0.2,0.2);",
				"	vec3 diffuseColor=vec3(0.4,0.4,0.4);",
				"	vec3 specularColor=vec3(0.4,0.4,0.4);",
				"	float shininess=100.0;"
			);
			if (options.projection=='ortho') {
				lines.a(
					"	vec3 V=vec3( 0.0, 0.0,+1.0);"
				);
			} else if (options.projection=='perspective') {
				lines.a(
					"	vec3 V=normalize(interpolatedView);"
				);
			}
			lines.a(
				"	vec3 N=normalize(interpolatedNormal);"
			);
			if (shape.twoSided) {
				lines.a(
					"	if (!gl_FrontFacing) N=-N;"
				);
			}
			lines.a(
				"	vec3 L=normalize("+lightDirectionVector.getGlslValue()+");",
				"	vec3 H=normalize(L+V);",
				"	gl_FragColor=vec4(",
				"		ambientColor",
				"		+diffuseColor*max(0.0,dot(L,N))",
				"		+specularColor*pow(max(0.0,dot(H,N)),shininess)",
				"	,1.0);",
				"}"
			);
		}
		return lines;
	}
	function generateHtmlControlMessageLines() {
		var lines=new Lines;
		function writeOptionGroup(group) {
			group.filter(function(option){
				return isMousemoveInput(option.name);
			}).forEach(function(option){
				lines.a(
					"<li>"+i18n('controls.type.'+options[option.name+'.input'])+" "+i18n('controls.to')+" <strong>"+i18n('options.'+option.name)+"</strong></li>"
				);
			});
		}
		writeOptionGroup(options.inputOptions);
		writeOptionGroup(options.transformOptions);
		return lines.wrapIfNotEmpty(
			"<ul>",
			"</ul>"
		);
	}
	function generateHtmlInputLines() {
		var lines=new Lines;
		function writeOptionGroup(group) {
			group.filter(function(option){
				return options[option.name+'.input']=='slider';
			}).forEach(function(option){
				lines.a(
					"<div>",
					"	<label for='"+option.name+"'>"+i18n('options.'+option.name)+":</label>"
				);
				if (option.name!='shape.lodShape.lod') {
					lines.a(
						"	<span class='min'>"+option.getMinLabel(options[option.name+'.min'])+"</span> "
					);
					if (option.getStep()==1) {
						lines.t(
							"<input type='range' id='"+option.name+"' min='"+intOptionValue(option.name+'.min')+"' max='"+intOptionValue(option.name+'.max')+"' value='"+intOptionValue(option.name)+"' />"
						);
					} else {
						lines.t(
							"<input type='range' id='"+option.name+"' min='"+floatOptionValue(option.name+'.min')+"' max='"+floatOptionValue(option.name+'.max')+"' step='"+option.getStep()+"' value='"+floatOptionValue(option.name)+"' />"
						);
					}
					lines.t(
						" <span class='max'>"+option.getMaxLabel(options[option.name+'.max'])+"</span>"
					);
				} else {
					lines.a(
						"	<span class='min'>"+option.getMinLabel(shape.lod.min)+"</span> "
					);
					lines.t(
							"<input type='range' id='"+option.name+"' min='"+shape.lod.min+"' max='"+shape.lod.max+"' value='"+shape.lod.value+"' />"
						);
					lines.t(
						" <span class='max'>"+option.getMaxLabel(shape.lod.max)+"</span>"
					);
				}
				lines.t(
					"</div>"
				);
			});
		}
		writeOptionGroup(options.inputOptions);
		writeOptionGroup(options.transformOptions);
		return lines;
	}
	function generateJsMakeProgramLines() {
		var lines=new Lines;
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
	function generateJsInitLines() {
		var lines=new Lines;
		lines.a(
			"var canvas=document.getElementById('myCanvas');",
			"var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');"
		);
		if (options['elements']=='32') {
			lines.a(
				"gl.getExtension('OES_element_index_uint');" // TODO check if null is returned and don't allow more elements
			);
		}
		if (options.background=='solid' && !options.hasInputsFor('background.solid.color') && !(
			// default clear color in OpenGL
			options['background.solid.color.r']==0 &&
			options['background.solid.color.g']==0 &&
			options['background.solid.color.b']==0 &&
			options['background.solid.color.a']==0
		)) {
			lines.a(
				"gl.clearColor("+colorValue('background.solid.color')+");"
			)
		}
		if (shape.dim>2) {
			lines.a(
				"gl.enable(gl.DEPTH_TEST);"
			);
		}
		lines.a(
			"var program=makeProgram(",
			"	document.getElementById('myVertexShader').text,",
			"	document.getElementById('myFragmentShader').text",
			");",
			"gl.useProgram(program);"
		);
		return lines;
	}
	function generateJsInputHandlerLines() {
		var writeListenerArgs=[!options.isAnimated(),options.debugInputs];
		var lines=new Lines;
		function writeListener(listener) {
			lines.a(
				listener.write.apply(listener,writeListenerArgs)
			);
		}
		var canvasMousemoveListener=new listeners.CanvasMousemoveListener();
		function canvasUpdater() {
			lines.a(
				"function updateAspect() {",
				"	gl.viewport(0,0,canvas.width,canvas.height);",
				"	gl.uniform1f(aspectLoc,canvas.width/canvas.height);",
				"}",
				"updateAspect();"
			);
		}
		function canvasListener(wh) {
			var optName='canvas.'+wh;
			if (options[optName+'.input']=='slider') {
				var listener=new listeners.SliderListener(optName);
				listener.enter()
					.log("console.log(this.id,'input value:',parseInt(this.value));")
					.post("canvas."+wh+"=parseInt(this.value);")
					.post("updateAspect();");
				writeListener(listener);
			}
		}
		function colorStates(optionPrefix,updateFnName,stateVarPrefix) {
			['r','g','b','a'].forEach(function(c){
				var name=optionPrefix+'.'+c;
				if (isMousemoveInput(name)) {
					lines.a(
						"var "+stateVarPrefix+c.toUpperCase()+'='+floatOptionValue(name)+';'
					);
				}
			});
		}
		function colorUpdater(optionPrefix,updateFnName,stateVarPrefix,allInputsPre,allInputsPost,someInputsPre,someInputsPost) {
			lines.a(
				"function "+updateFnName+"() {"
			);
			if (options.hasAllSliderInputsFor(optionPrefix)) {
				lines.a(
					"	"+allInputsPre+"['r','g','b','a'].map(function(c){",
					"		return parseFloat(document.getElementById('"+optionPrefix+".'+c).value);",
					"	})"+allInputsPost
				);
			// TODO hasAllStateInputsFor(optionPrefix)
			} else {
				lines.a(
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
			lines.a(
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
						.minMaxFloat(options[name+'.input'],varName,floatOptionValue(name+'.min'),floatOptionValue(name+'.max'))
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
		if (options.hasInputsFor('canvas')) {
			lines.a(
				"var aspectLoc=gl.getUniformLocation(program,'aspect');"
			);
			canvasUpdater();
			canvasListener('width');
			canvasListener('height');
		}
		if (options.hasInputsFor('background.solid.color')) {
			colorStatesAndUpdaterAndListeners(
				'background.solid.color','updateClearColor','clearColor',
				'gl.clearColor.apply(gl,',');',
				'gl.clearColor(',');'
			);
		}
		if (options.shader=='single') {
			lines.a(
				colorVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener)
			);
		} else if (options.shader=='light') {
			lines.a(
				lightDirectionVector.getJsInterfaceLines(writeListenerArgs,canvasMousemoveListener)
			);
		}
		options.getInputsFor('shape').forEach(function(option){
			function varName(prefix) {
				var i=option.name.lastIndexOf('.');
				var s=option.name.substring(i+1);
				var S=s.charAt(0).toUpperCase()+s.slice(1);
				if (prefix!==undefined) {
					return prefix+'Shape'+S;
				} else {
					return 'shape'+S;
				}
			}
			if (options[option.name+'.input']=='slider') {
				var listener=new listeners.SliderListener(option.name);
				listener.enter()
					.log("console.log(this.id,'input value:',parseInt(this.value));")
					.post("storeShape(parseInt(this.value));");
				writeListener(listener);
			} else if (isMousemoveInput(option.name)) {
				canvasMousemoveListener.enter()
					.newVarInt(options[option.name+'.input'],varName())
					.cond(varName('new')+"!="+varName())
					.log("console.log('"+option.name+" input value:',"+varName('new')+");")
					.post("storeShape("+varName('new')+");");
			}
		});
		['x','y','z'].forEach(function(d){
			var D=d.toUpperCase();
			var optName='rotate.'+d;
			var varName='rotate'+D;
			var updateName='updateRotate'+D;
			if (options[optName+'.input']=='slider') {
				var listener=new listeners.SliderListener(optName);
				var entry=listener.enter()
					.log("console.log(this.id,'input value:',parseFloat(this.value));");
				if (options[optName+'.speed']==0 && options[optName+'.speed.input']=='constant') {
					lines.a(
						"var "+varName+"Loc=gl.getUniformLocation(program,'"+varName+"');",
						"function "+updateName+"() {",
						"	gl.uniform1f("+varName+"Loc,parseFloat(document.getElementById('"+optName+"').value));",
						"};",
						updateName+"();" // have to initialize the uniform even if default value is zero because the browser may keep prev value of slider on page reload
					);
					entry.post(updateName+"();");
				}
				writeListener(listener);
			} else if (isMousemoveInput(optName)) {
				if (options[optName+'.speed']==0 && options[optName+'.speed.input']=='constant') {
					lines.a(
						"var "+varName+"Loc=gl.getUniformLocation(program,'"+varName+"');",
						"gl.uniform1f("+varName+"Loc,"+floatOptionValue(optName)+");"
					);
					canvasMousemoveListener.enter()
						.minMaxVarFloat(options[optName+'.input'],varName,'-180','+180')
						.log("console.log('"+optName+" input value:',"+varName+");")
						.post("gl.uniform1f("+varName+"Loc,"+varName+");");
				} else {
					canvasMousemoveListener.enter()
						.state("var "+varName+"="+floatOptionValue(optName)+";")
						.minMaxFloat(options[optName+'.input'],varName,'-180','+180')
						.log("console.log('"+optName+" input value:',"+varName+");");
				}
			}
			if (options[optName+'.speed.input']=='slider') {
				var listener=new listeners.SliderListener(optName+'.speed');
				listener.enter()
					.log("console.log(this.id,'input value:',parseFloat(this.value));");
				writeListener(listener);
			} else if (isMousemoveInput(optName+'.speed')) {
				canvasMousemoveListener.enter()
					.state("var "+varName+"Speed="+floatOptionValue(optName+'.speed')+";")
					.minMaxFloat(options[optName+'.speed.input'],varName+'Speed','-360','+360')
					.log("console.log('"+optName+".speed input value:',"+varName+"Speed);");
			}
		});
		writeListener(canvasMousemoveListener);
		return lines;
	}
	function generateJsRenderLines() {
		var needStartTime=false; // set by renderInner()
		var needPrevTime=false; // set by renderInner()
		function renderInner() {
			var needWrap=false; // set by renderInnerTransforms()
			function renderInnerTransforms() {
				var lines=new Lines;
				['x','y','z'].forEach(function(d){
					var D=d.toUpperCase();
					var optName='rotate.'+d;
					var varName='rotate'+D;
					if (options[optName+'.speed']!=0 || options[optName+'.speed.input']!='constant') {
						if (options[optName+'.speed.input']=='constant' && options[optName+'.input']=='constant') {
							// no rotation state branch
							needStartTime=true;
							lines.a(
								"var "+varName+"="+(options[optName]
									? floatOptionValue(optName)+"+"
									: ""
								)+floatOptionValue(optName+'.speed')+"*(time-startTime)/1000;"
							);
						} else {
							// rotation state branch
							needPrevTime=true;
							if (options[optName+'.input']=='slider') {
								lines.a(
									"var "+varName+"Input=document.getElementById('"+optName+"');",
									"var "+varName+"=parseFloat("+varName+"Input.value);"
								);
							}
							if (options[optName+'.speed.input']=='slider') {
								lines.a(
									"var "+varName+"SpeedInput=document.getElementById('"+optName+".speed');",
									"var "+varName+"Speed=parseFloat("+varName+"SpeedInput.value);"
								);
							}
							lines.a(
								varName+"+="+(options[optName+'.speed.input']=='constant'
									? floatOptionValue(optName+'.speed')
									: varName+"Speed"
								)+"*(time-prevTime)/1000;"
							);
							if (options[optName+'.input']=='slider') {
								needWrap=true;
								lines.a(
									varName+"=wrap("+varName+",180);",
									varName+"Input.value="+varName+";"
								);
							}
						}
						lines.a(
							"gl.uniform1f("+varName+"Loc,"+varName+");"
						);
					}
				});
				return lines;
			}
			var innerTransformsLines=renderInnerTransforms();
			var lines=new Lines;
			if (needWrap) {
				lines.a(
					"function wrap(v,maxAbsV) {",
					"	v%=maxAbsV*2;",
					"	if (Math.abs(v)<=maxAbsV) return v;",
					"	return v-(v>0?1:-1)*maxAbsV*2;",
					"}"
				);
			}
			if (options.background=='solid') {
				lines.a(
					"gl.clear(gl.COLOR_BUFFER_BIT);"
				);
			}
			lines.a(
				innerTransformsLines,
				shape.writeDraw()
			);
			return lines;
		}
		var lines=new Lines;
		var innerLines=renderInner();
		if (options.isAnimated()) {
			['x','y','z'].forEach(function(d){
				var D=d.toUpperCase();
				var optName='rotate.'+d;
				var varName='rotate'+D;
				if (
					options.needsUniform(optName) && !(
						// no Loc was generated in generateInputHandlerLines()
						(options[optName+'.input']=='slider' || isMousemoveInput(optName)) &&
						options[optName+'.speed']==0 && options[optName+'.speed.input']=='constant'
					)
				) {
					lines.a(
						"var "+varName+"Loc=gl.getUniformLocation(program,'"+varName+"');"
					);
				}
				if (options[optName+'.speed.input']!='constant' && options[optName+'.input']=='constant') {
					lines.a(
						"var "+varName+"="+floatOptionValue(optName)+";"
					);
				}
			});
			if (needStartTime && needPrevTime) {
				lines.a(
					"var startTime=performance.now();",
					"var prevTime=startTime;"
				);
			} else if (needStartTime) {
				lines.a(
					"var startTime=performance.now();"
				);
			} else if (needPrevTime) {
				lines.a(
					"var prevTime=performance.now();"
				);
			}
		}
		// wrap inner render lines in function if needed
		if (options.isAnimated()) {
			lines.a(
				"function renderFrame(time) {",
				innerLines.indent()
			);
			if (needPrevTime) {
				lines.a(
					"	prevTime=time;"
				);
			}
			lines.a(
				"	requestAnimationFrame(renderFrame);",
				"}",
				"requestAnimationFrame(renderFrame);"
			);
		} else if (options.hasInputs()) {
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

	var scriptLines=new Lines;
	scriptLines.interleave(
		generateJsMakeProgramLines(),
		generateJsInitLines(),
		shape.writeInit(options.debugArrays),
		generateJsInputHandlerLines(),
		generateJsRenderLines()
	).wrap(
		"<script>",
		"</script>"
	);
	var lines=new Lines;
	lines.a(
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>Generated code</title>",
		generateHtmlStyleLines(),
		"<script id='myVertexShader' type='x-shader/x-vertex'>",
		generateVertexShaderLines().indent(),
		"</script>",
		"<script id='myFragmentShader' type='x-shader/x-fragment'>",
		generateFragmentShaderLines().indent(),
		"</script>",
		"</head>",
		"<body>",
		"<div>",
		"	<canvas id='myCanvas' width='"+intOptionValue('canvas.width')+"' height='"+intOptionValue('canvas.height')+"'></canvas>",
		"</div>",
		generateHtmlControlMessageLines(),
		generateHtmlInputLines(),
		scriptLines,
		"</body>",
		"</html>"
	);
	return lines.join(
		options.indent=='tab' ? '\t' : Array(parseInt(options.indent)+1).join(' ')
	);
};
