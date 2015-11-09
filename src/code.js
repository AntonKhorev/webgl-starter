var listeners=require('./listeners.js');
var shapes=require('./shapes.js');

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
	function glslColorValue(prefix) {
		var r=floatOptionValue(prefix+'.r');
		var g=floatOptionValue(prefix+'.g');
		var b=floatOptionValue(prefix+'.b');
		var a=floatOptionValue(prefix+'.a');
		if (r==a && g==a && b==a) {
			return a; // see OpenGL ES SL section 5.4.2
		} else {
			return r+","+g+","+b+","+a;
		}
	}
	function isMousemoveInput(name) {
		return ['mousemovex','mousemovey'].indexOf(options[name+'.input'])>=0;
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

	function makeShape() {
		if (options.shape=='square') {
			return new shapes.Square(options.shader);
		} else if (options.shape=='triangle') {
			return new shapes.Triangle(options.shader);
		} else if (options.shape=='gasket') {
			return new shapes.Gasket(options.shader,intOptionValue('shape.gasket.depth'),options['shape.gasket.depth.input']!='constant');
		} else if (options.shape=='cube') {
			return new shapes.Cube(options.shader);
		} else if (options.shape=='hat') {
			return new shapes.Hat(options.shader);
		}
	}
	var shape=makeShape();

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
		var lines=[];
		if (needAspectUniform) {
			lines.push("uniform float aspect;");
		}
		['x','y','z'].forEach(function(d){
			var D=d.toUpperCase();
			var optName='rotate.'+d;
			var varName='rotate'+D;
			if (options.needsUniform(optName)) {
				lines.push("uniform float "+varName+";");
			}
		});
		if (use2dTransform) {
			lines.push("attribute vec2 position;");
		} else {
			lines.push("attribute vec4 position;");
		}
		if (options.shader=='light') {
			if (options.projection=='perspective') {
				lines.push("varying vec3 interpolatedView;");
			}
			if (shape.dim>2) {
				lines.push("attribute vec3 normal;");
			}
			lines.push("varying vec3 interpolatedNormal;");
		}
		if (options.shader=='vertex' || options.shader=='face') {
			lines.push(
				"attribute vec4 color;",
				"varying vec4 interpolatedColor;" // TODO don't interpolate for shader=='face'
			);
		}
		lines.push(
			"void main() {"
		);
		['x','y','z'].forEach(function(d){
			var D=d.toUpperCase();
			var optName='rotate.'+d;
			var varName='rotate'+D;
			if (options.needsTransform(optName)) {
				if (options.needsUniform('rotate.'+d)) {
					lines.push(
						"	float c"+d+"=cos(radians("+varName+"));",
						"	float s"+d+"=sin(radians("+varName+"));"
					);
				} else {
					lines.push(
						"	float c"+d+"=cos(radians("+floatOptionValue(optName)+"));",
						"	float s"+d+"=sin(radians("+floatOptionValue(optName)+"));"
					);
				}
			}
		});
		if (needAspectConstant) {
			lines.push(
				"	float aspect="+intOptionValue('canvas.width')+".0/"+intOptionValue('canvas.height')+".0;"
			);
		}
		if (options.projection=='perspective') {
			lines.push(
				"	float fovy=45.0;",
				"	float near=1.0/tan(radians(fovy)/2.0);",
				"	float far=near+2.0;"
			);
		}
		if (needTransformedPosition) {
			lines.push(
				"	vec4 transformedPosition="
			);
		} else {
			lines.push(
				"	gl_Position="
			);
		}
		if (use2dTransform) {
			appendLinesToLastLine(lines,[
				"vec4(position*mat2(",
				"	cz, -sz,",
				"	sz,  cz",
				"),0,1)"
			]);
		} else {
			appendLinesToLastLine(lines,[
				"position"
			]);
			options.transformOrder.forEach(function(transformName){
				if (!options.needsTransform(transformName)) {
					return;
				}
				appendLinesToLastLine(lines,{
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
				appendLinesToLastLine(lines,[
					"*mat4( // move center of coords inside view",
					"	1.0, 0.0, 0.0, 0.0,",
					"	0.0, 1.0, 0.0, 0.0,",
					"	0.0, 0.0, 1.0, -(near+far)/2.0,",
					"	0.0, 0.0, 0.0, 1.0",
					")"
				]);
			}
		}
		if (needTransformedPosition) {
			appendLinesToLastLine(lines,[
				";"
			]);
			lines.push(
				"	gl_Position=transformedPosition"
			);
		}
		if (options.projection=='ortho') {
			if (needAspectUniform || needAspectConstant) {
				appendLinesToLastLine(lines,[
					"*vec4(1.0/aspect,1.0,-1.0,1.0)" // correct aspect ratio and make coords right-handed
				]);
			} else if (shape.dim>2) {
				appendLinesToLastLine(lines,[
					"*vec4(1.0,1.0,-1.0,1.0)" // make coords right-handed for 3d shapes
				]);
			}
		} else if (options.projection=='perspective') {
			if (needAspectUniform || needAspectConstant) {
				appendLinesToLastLine(lines,[
					"*mat4(",
					"	near/aspect, 0.0,  0.0,                   0.0,",
					"	0.0,         near, 0.0,                   0.0,",
					"	0.0,         0.0,  (near+far)/(near-far), 2.0*near*far/(near-far),",
					"	0.0,         0.0,  -1.0,                  0.0",
					")"
				]);
			} else {
				appendLinesToLastLine(lines,[
					"*mat4(",
					"	near, 0.0,  0.0,                   0.0,",
					"	0.0,  near, 0.0,                   0.0,",
					"	0.0,  0.0,  (near+far)/(near-far), 2.0*near*far/(near-far),",
					"	0.0,  0.0,  -1.0,                  0.0",
					")"
				]);
			}
		}
		appendLinesToLastLine(lines,[
			";"
		]);
		if (options.shader=='light') {
			if (options.projection=='perspective') {
				lines.push(
					"	interpolatedView=-vec3(transformedPosition);"
				);
			}
			if (shape.dim>2) {
				lines.push(
					"	interpolatedNormal=normal"
				);
			} else {
				lines.push(
					"	interpolatedNormal=vec3(0.0,0.0,1.0)"
				);
			}
			options.transformOrder.forEach(function(transformName){
				if (!options.needsTransform(transformName)) {
					return;
				}
				appendLinesToLastLine(lines,{
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
			appendLinesToLastLine(lines,[
				";"
			]);
		}
		if (options.shader=='vertex' || options.shader=='face') {
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
		if (options.shader=='single') {
			if (options.hasInputsFor('shader.single.color')) {
				return [
					"uniform vec4 color;",
					"void main() {",
					"	gl_FragColor=color;",
					"}",
				];
			} else {
				return [
					"void main() {",
					"	gl_FragColor=vec4("+glslColorValue('shader.single.color')+");",
					"}",
				];
			}
		} else if (options.shader=='vertex' || options.shader=='face') {
			return [
				"varying vec4 interpolatedColor;",
				"void main() {",
				"	gl_FragColor=interpolatedColor;",
				"}",
			];
		} else if (options.shader=='light') {
			var lines=[];
			if (options.projection=='perspective') {
				lines.push("varying vec3 interpolatedView;");
			}
			lines.push(
				"varying vec3 interpolatedNormal;",
				"void main() {",
				"	vec3 ambientColor=vec3(0.2,0.2,0.2);",
				"	vec3 diffuseColor=vec3(0.4,0.4,0.4);",
				"	vec3 specularColor=vec3(0.4,0.4,0.4);",
				"	float shininess=100.0;"
			);
			if (options.projection=='ortho') {
				lines.push(
					"	vec3 V=vec3( 0.0, 0.0,+1.0);"
				);
			} else if (options.projection=='perspective') {
				lines.push(
					"	vec3 V=normalize(interpolatedView);"
				);
			}
			lines.push(
				"	vec3 N=normalize(interpolatedNormal);"
			);
			if (shape.dim==2) {
				lines.push(
					"	N*=sign(dot(V,N));"
				);
			}
			lines.push(
				"	vec3 L=normalize(vec3(-1.0,+1.0,+1.0));",
				"	vec3 H=normalize(L+V);",
				"	gl_FragColor=vec4(",
				"		ambientColor",
				"		+diffuseColor*max(0.0,dot(L,N))",
				"		+specularColor*pow(max(0.0,dot(H,N)),shininess)",
				"	,1.0);",
				"}"
			);
			return lines;
		}
	}
	function generateControlMessageLines() {
		var lines=[];
		function writeOptionGroup(group) {
			group.filter(function(option){
				return isMousemoveInput(option.name);
			}).forEach(function(option){
				lines.push(
					"	<li>"+i18n('controls.type.'+options[option.name+'.input'])+" "+i18n('controls.to')+" <strong>"+i18n('options.'+option.name)+"</strong></li>"
				);
			});
		}
		writeOptionGroup(options.inputOptions);
		writeOptionGroup(options.transformOptions);
		if (lines.length) {
			return ["<ul>"].concat(lines,["</ul>"]);
		} else {
			return [];
		}
	}
	function generateInputLines() {
		var lines=[];
		function writeOptionGroup(group) {
			group.filter(function(option){
				return options[option.name+'.input']=='slider';
			}).forEach(function(option){
				lines.push(
					"<div>",
					"	<label for='"+option.name+"'>"+i18n('options.'+option.name)+":</label>",
					"	<span class='min'>"+option.getMinLabel()+"</span> "+
						(option.getStep()==1
							? "<input type='range' id='"+option.name+"' min='"+option.getMin()+"' max='"+option.getMax()+"' value='"+intOptionValue(option.name)+"' />"
							: "<input type='range' id='"+option.name+"' min='"+option.getMin()+"' max='"+option.getMax()+"' step='"+option.getStep()+"' value='"+floatOptionValue(option.name)+"' />"
						)+
						" <span class='max'>"+option.getMaxLabel()+"</span>",
					"</div>"
				);
			});
		}
		writeOptionGroup(options.inputOptions);
		writeOptionGroup(options.transformOptions);
		return lines;
	}
	function generateMakeProgramLines() {
		lines=[
			"function makeProgram(vertexShaderSrc,fragmentShaderSrc) {",
			"	var vertexShader=gl.createShader(gl.VERTEX_SHADER);",
			"	gl.shaderSource(vertexShader,vertexShaderSrc);",
			"	gl.compileShader(vertexShader);",
		];
		if (options.debugShader) {
			lines.push(
				"	if (!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vertexShader));"
			);
		}
		lines.push(
			"	var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);",
			"	gl.shaderSource(fragmentShader,fragmentShaderSrc);",
			"	gl.compileShader(fragmentShader);"
		);
		if (options.debugShader) {
			lines.push(
				"	if (!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fragmentShader));"
			);
		}
		lines.push(
			"	var program=gl.createProgram();",
			"	gl.attachShader(program,vertexShader);",
			"	gl.attachShader(program,fragmentShader);",
			"	gl.linkProgram(program);",
			"	return program;",
			"}"
		);
		return lines;
	}
	function generateInputHandlerLines() {
		var lines=[];
		function writeListener(listener) {
			lines=lines.concat(
				listener.write(!options.isAnimated(),options.debugInputs)
			);
		}
		var canvasMousemoveListener=new listeners.CanvasMousemoveListener();
		function canvasUpdater() {
			lines.push(
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
					lines.push(
						"var "+stateVarPrefix+c.toUpperCase()+'='+floatOptionValue(name)+';'
					);
				}
			});
		}
		function colorUpdater(optionPrefix,updateFnName,stateVarPrefix,allInputsPre,allInputsPost,someInputsPre,someInputsPost) {
			lines.push(
				"function "+updateFnName+"() {"
			);
			if (options.hasAllSliderInputsFor(optionPrefix)) {
				lines.push(
					"	"+allInputsPre+"['r','g','b','a'].map(function(c){",
					"		return parseFloat(document.getElementById('"+optionPrefix+".'+c).value);",
					"	})"+allInputsPost
				);
			// TODO hasAllStateInputsFor(optionPrefix)
			} else {
				lines.push(
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
			lines.push(
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
						.prexy(
							options[name+'.input'],
							varName+"=(ev.clientX-rect.left)/(rect.width-1);",
							varName+"=(rect.bottom-1-ev.clientY)/(rect.height-1);"
						)
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
			lines.push(
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
		if (options.hasInputsFor('shader.single.color')) {
			lines.push(
				"var colorLoc=gl.getUniformLocation(program,'color');"
			);
			colorStatesAndUpdaterAndListeners(
				'shader.single.color','updateColor','color',
				'gl.uniform4fv(colorLoc,',');',
				'gl.uniform4fv(colorLoc,[',']);'
			);
		}
		if (options['shape.gasket.depth.input']=='slider') {
			var listener=new listeners.SliderListener('shape.gasket.depth');
			listener.enter()
				.log("console.log(this.id,'input value:',parseInt(this.value));")
				.post("storeGasketVertices(parseInt(this.value));")
				.post("gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);");
			writeListener(listener);
		} else if (isMousemoveInput('shape.gasket.depth')) {
			canvasMousemoveListener.enter()
				.prexy(
					options['shape.gasket.depth.input'],
					"var newGasketDepth=Math.floor((gasketMaxDepth+1)*(ev.clientX-rect.left)/rect.width);",
					"var newGasketDepth=Math.floor((gasketMaxDepth+1)*(rect.bottom-1-ev.clientY)/rect.height);"
				)
				.cond("newGasketDepth!=gasketDepth")
				.log("console.log('shape.gasket.depth input value:',newGasketDepth);")
				.post("storeGasketVertices(newGasketDepth);")
				.post("gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);");
		}
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
					lines.push(
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
					lines.push(
						"var "+varName+"Loc=gl.getUniformLocation(program,'"+varName+"');",
						"gl.uniform1f("+varName+"Loc,"+floatOptionValue(optName)+");"
					);
					canvasMousemoveListener.enter()
						.prexy(
							options[optName+'.input'],
							"var "+varName+"=180*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",
							"var "+varName+"=180*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));"
						)
						.log("console.log('"+optName+" input value:',"+varName+");")
						.post("gl.uniform1f("+varName+"Loc,"+varName+");");
				} else {
					canvasMousemoveListener.enter()
						.state("var "+varName+"="+floatOptionValue(optName)+";")
						.prexy(
							options[optName+'.input'],
							varName+"=180*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",
							varName+"=180*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));"
						)
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
					.prexy(
						options[optName+'.speed.input'],
						varName+"Speed=360*(-1+2*(ev.clientX-rect.left)/(rect.width-1));",
						varName+"Speed=360*(-1+2*(rect.bottom-1-ev.clientY)/(rect.height-1));"
					)
					.log("console.log('"+optName+".speed input value:',"+varName+"Speed);");
			}
		});
		writeListener(canvasMousemoveListener);
		if (lines.length) lines.push("	");
		return lines;
	}
	function generateRenderLines() {
		var needStartTime=false; // set by renderInner()
		var needPrevTime=false; // set by renderInner()
		function renderInner() {
			var needWrap=false; // set by renderInnerTransforms()
			function renderInnerTransforms() {
				var lines=[];
				['x','y','z'].forEach(function(d){
					var D=d.toUpperCase();
					var optName='rotate.'+d;
					var varName='rotate'+D;
					if (options[optName+'.speed']!=0 || options[optName+'.speed.input']!='constant') {
						if (options[optName+'.speed.input']=='constant' && options[optName+'.input']=='constant') {
							// no rotation state branch
							needStartTime=true;
							lines.push(
								"var "+varName+"="+(options[optName]
									? floatOptionValue(optName)+"+"
									: ""
								)+floatOptionValue(optName+'.speed')+"*(time-startTime)/1000;"
							);
						} else {
							// rotation state branch
							needPrevTime=true;
							if (options[optName+'.input']=='slider') {
								lines.push(
									"var "+varName+"Input=document.getElementById('"+optName+"');",
									"var "+varName+"=parseFloat("+varName+"Input.value);"
								);
							}
							if (options[optName+'.speed.input']=='slider') {
								lines.push(
									"var "+varName+"SpeedInput=document.getElementById('"+optName+".speed');",
									"var "+varName+"Speed=parseFloat("+varName+"SpeedInput.value);"
								);
							}
							lines.push(
								varName+"+="+(options[optName+'.speed.input']=='constant'
									? floatOptionValue(optName+'.speed')
									: varName+"Speed"
								)+"*(time-prevTime)/1000;"
							);
							if (options[optName+'.input']=='slider') {
								needWrap=true;
								lines.push(
									varName+"=wrap("+varName+",180);",
									varName+"Input.value="+varName+";"
								);
							}
						}
						lines.push(
							"gl.uniform1f("+varName+"Loc,"+varName+");"
						);
					}
				});
				return lines;
			}
			var innerTransformsLines=renderInnerTransforms();
			var lines=[];
			if (needWrap) {
				lines.push(
					"function wrap(v,maxAbsV) {",
					"	v%=maxAbsV*2;",
					"	if (Math.abs(v)<=maxAbsV) return v;",
					"	return v-(v>0?1:-1)*maxAbsV*2;",
					"}"
				);
			}
			if (options.background=='solid') {
				lines.push(
					"gl.clear(gl.COLOR_BUFFER_BIT);"
				);
			}
			lines=lines.concat(
				innerTransformsLines,
				shape.writeDraw()
			);
			return lines;
		}
		var lines=[];
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
					lines.push(
						"var "+varName+"Loc=gl.getUniformLocation(program,'"+varName+"');"
					);
				}
				if (options[optName+'.speed.input']!='constant' && options[optName+'.input']=='constant') {
					lines.push(
						"var "+varName+"="+floatOptionValue(optName)+";"
					);
				}
			});
			if (needStartTime && needPrevTime) {
				lines.push(
					"var startTime=performance.now();",
					"var prevTime=startTime;"
				);
			} else if (needStartTime) {
				lines.push(
					"var startTime=performance.now();"
				);
			} else if (needPrevTime) {
				lines.push(
					"var prevTime=performance.now();"
				);
			}
		}
		// wrap inner render lines in function if needed
		if (options.isAnimated()) {
			lines.push(
				"function renderFrame(time) {"
			);
			lines=lines.concat(indentLines(1,innerLines));
			if (needPrevTime) {
				lines.push(
					"	prevTime=time;"
				);
			}
			lines.push(
				"	requestAnimationFrame(renderFrame);",
				"}",
				"requestAnimationFrame(renderFrame);"
			);
		} else if (options.hasInputs()) {
			lines.push(
				"var frameId=null;",
				"function renderFrame() {"
			);
			lines=lines.concat(indentLines(1,innerLines));
			lines.push(
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
			lines=lines.concat(innerLines);
		}
		return lines;
	}

	return [].concat([
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>Generated code</title>",
	],options.hasSliderInputs()?[
		"<style>",
		"	label {",
		"		display: inline-block;",
		"		width: 15em;",
		"		text-align: right;",
		"	}",
		"	.min {",
		"		display: inline-block;",
		"		width: 3em;",
		"		text-align: right;",
		"	}",
		"	.max {",
		"		display: inline-block;",
		"		width: 3em;",
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
		"	<canvas id='myCanvas' width='"+intOptionValue('canvas.width')+"' height='"+intOptionValue('canvas.height')+"'></canvas>",
		"</div>",
	],generateControlMessageLines(),generateInputLines(),[
		"<script>",
	],indentLines(1,generateMakeProgramLines()),[
		"	",
		"	var canvas=document.getElementById('myCanvas');",
		"	var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');",
	],(
		options.background=='solid' && !options.hasInputsFor('background.solid.color') && !(
			// default clear color in OpenGL
			options['background.solid.color.r']==0 &&
			options['background.solid.color.g']==0 &&
			options['background.solid.color.b']==0 &&
			options['background.solid.color.a']==0
		)
	)?[
		"	gl.clearColor("+colorValue('background.solid.color')+");",
	]:[],shape.dim>2?[
		"	gl.enable(gl.DEPTH_TEST);"
	]:[],[
		"	var program=makeProgram(",
		"		document.getElementById('myVertexShader').text,",
		"		document.getElementById('myFragmentShader').text",
		"	);",
		"	gl.useProgram(program);",
		"	",
	],indentLines(1,shape.writeInit()),[
		"	",
	],indentLines(1,generateInputHandlerLines()),indentLines(1,generateRenderLines()),[
		"</script>",
		"</body>",
		"</html>",
	]).join("\n");
};
