'use strict';

module.exports=function(id,n){ // fake temporary i18n
	function number(n) {
		return n.toString().replace('-','−');
	}
	function plural(n,word) {
		if (n==1) {
			return word;
		} else {
			return word+'s';
		}
	}
	const plainValue=x=>number(x);
	const pixelValue=n=>number(n)+" <abbr title='"+plural(n,'pixel')+"'>px</abbr>";
	const strings={
		'message.hljs': "<a href='https://highlightjs.org/'>highlight.js</a> (hosted on cdnjs.cloudflare.com) is not loaded. Syntax highlighting is disabled.",
		'message.elements': "choosing 8- or 16-bit index may limit available shape detail levels",

		'options.canvas': "Canvas",
		'options.canvas.width': "Canvas width",
		'options.canvas.width.value': pixelValue,
		'options.canvas.height': "Canvas height",
		'options.canvas.height.value': pixelValue,

		'options.background': "Background",
		'options.background.type': "Background type",
		'options.background.type.none': "none (transparent)",
		'options.background.type.solid': "solid color",
		'options.background.color': "Background color",
		'options.background.color.r': 'Background color red component',
		'options.background.color.g': 'Background color green component',
		'options.background.color.b': 'Background color blue component',
		'options.background.color.a': 'Background color alpha component',
		'options.background.color.r.value': plainValue,
		'options.background.color.g.value': plainValue,
		'options.background.color.b.value': plainValue,
		'options.background.color.a.value': plainValue,
		'options.background.color.r.speed': 'Background color red speed',
		'options.background.color.g.speed': 'Background color green speed',
		'options.background.color.b.speed': 'Background color blue speed',
		'options.background.color.a.speed': 'Background color alpha speed',
		'options.background.color.r.speed.value': plainValue,
		'options.background.color.g.speed.value': plainValue,
		'options.background.color.b.speed.value': plainValue,
		'options.background.color.a.speed.value': plainValue,

		'options.material': "Material",
		'options.material.scope': "Set material color for objects",
		'options.material.scope.global': "entire scene",
		'options.material.scope.vertex': "shape vertices",
		'options.material.scope.face': "shape faces",
		'options.material.data': "For each object have",
		'options.material.data.one': "one color",
		'options.material.data.sda': "specular/diffuse/ambient colors",
		'options.material.color': "Material color",
		'options.material.color.r': "Material color red component",
		'options.material.color.g': "Material color green component",
		'options.material.color.b': "Material color blue component",
		'options.material.color.a': "Material color alpha component",
		'options.material.color.r.value': plainValue,
		'options.material.color.g.value': plainValue,
		'options.material.color.b.value': plainValue,
		'options.material.color.a.value': plainValue,
		'options.material.color.r.speed': "Material color red speed",
		'options.material.color.g.speed': "Material color green speed",
		'options.material.color.b.speed': "Material color blue speed",
		'options.material.color.a.speed': "Material color alpha speed",
		'options.material.color.r.speed.value': plainValue,
		'options.material.color.g.speed.value': plainValue,
		'options.material.color.b.speed.value': plainValue,
		'options.material.color.a.speed.value': plainValue,

		'ui.inputs': "Input method",
		'ui.inputs.constant': "none",
		'ui.inputs.slider': "slider",
		'ui.inputs.mousemovex': "mouse x axis",
		'ui.inputs.mousemovey': "mouse y axis",
		'ui.inputs.gamepad0': "gamepad 0 axis",
		'ui.inputs.gamepad1': "gamepad 1 axis",
		'ui.inputs.gamepad2': "gamepad 2 axis",
		'ui.inputs.gamepad3': "gamepad 3 axis",
		'ui.range': "with range",
		'ui.reset': "Reset",
		'ui.addSpeed': "Add speed",

		// TODO review strings below
		'options.shape': 'Shape to draw',
		'options.shape.square': 'square',
		'options.shape.triangle': 'triangle',
		'options.shape.gasket': 'Sierpinski gasket', // wp: Sierpinski triangle
		'options.shape.cube': 'cube',
		'options.shape.hat': 'Mexican hat function', // wp: Mexican hat wavelet
		'options.shape.terrain': 'diamond-square fractal terrain', // wp: Diamond-square algorithm
		'options.elements': 'Element array',
		'options.elements.0': 'not used',
		'options.elements.8': 'with 8-bit index',
		'options.elements.16': 'with 16-bit index',
		'options.elements.32': 'with 32-bit index',
		'options.light': 'Light', // directional if on
		'options.light.off': 'off',
		'options.light.phong': 'on with Phong reflections', // wp: Phong reflection model
		'options.light.blinn': 'on with Blinn–Phong reflections', // wp: Blinn–Phong shading model
		'options.projection': 'Projection',
		'options.projection.ortho': 'orthogonal',
		'options.projection.perspective': 'perspective',

		'options.materialSpecularColor.r': 'Specular color red component',
		'options.materialSpecularColor.g': 'Specular color green component',
		'options.materialSpecularColor.b': 'Specular color blue component',
		'options.materialDiffuseColor.r': 'Diffuse color red component',
		'options.materialDiffuseColor.g': 'Diffuse color green component',
		'options.materialDiffuseColor.b': 'Diffuse color blue component',
		'options.materialAmbientColor.r': 'Ambient color red component',
		'options.materialAmbientColor.g': 'Ambient color green component',
		'options.materialAmbientColor.b': 'Ambient color blue component',
		'options.lightDirection.x': 'Light direction x component',
		'options.lightDirection.y': 'Light direction y component',
		'options.lightDirection.z': 'Light direction z component',
		'options.shapeLod': 'Shape detail level', // recursion depth for fractal shapes

		'options.transform': 'Transforms',
		'options.rotate.x': 'Angle of rotation around x axis',
		'options.rotate.x.speed': 'Speed of rotation around x axis',
		'options.rotate.y': 'Angle of rotation around y axis',
		'options.rotate.y.speed': 'Speed of rotation around y axis',
		'options.rotate.z': 'Angle of rotation around z axis',
		'options.rotate.z.speed': 'Speed of rotation around z axis',

		'options.debug': 'Debug options',
		'options.debugShaders': 'Log shader compilation errors',
		'options.debugArrays': 'Log allocated array sizes',
		'options.debugInputs': 'Log input values',

		'options.formatting': 'Code formatting options',
		'options.indent': 'Indent',
		'options.indent.tab': 'tab',
		'options.indent.2': '2 spaces',
		'options.indent.4': '4 spaces',
		'options.indent.8': '8 spaces',

		'controls.type.mousemovex': 'Move the mouse pointer horizontally over the canvas',
		'controls.type.mousemovey': 'Move the mouse pointer vertically over the canvas',
		'controls.to': 'to update',
	};
	if (strings[id]===undefined) {
		throw new Error("undefined string "+id);
	} if (typeof strings[id] == 'string') {
		return strings[id];
	} else {
		return strings[id](n);
	}
};
