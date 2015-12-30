'use strict';

module.exports=function(id){ // fake temporary i18n
	return {
		'message.hljs': "<a href='https://highlightjs.org/'>highlight.js</a> (hosted on cdnjs.cloudflare.com) is not loaded. Syntax highlighting is disabled.",
		'message.elements': "choosing 8- or 16-bit index may limit available shape detail levels",

		'options.background': 'Background',
		'options.background.type': 'Background type',
		'options.background.type.none': 'none (transparent)',
		'options.background.type.solid': 'solid color',
		'options.material': 'Material',
		'options.material.scope': 'Set material color for objects',
		'options.material.scope.global': 'entire scene',
		'options.material.scope.vertex': 'shape vertices',
		'options.material.scope.face': 'shape faces',
		'options.material.data': 'For each object have',
		'options.material.data.one': 'one color',
		'options.material.data.sda': 'specular/diffuse/ambient colors',
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

		'options.input': 'Input options',
		'options.canvas.width': 'Canvas width',
		'options.canvas.height': 'Canvas height',
		'options.backgroundColor.r': 'Background color red component',
		'options.backgroundColor.g': 'Background color green component',
		'options.backgroundColor.b': 'Background color blue component',
		'options.backgroundColor.a': 'Background color alpha component',
		'options.materialColor.r': 'Material color red component',
		'options.materialColor.g': 'Material color green component',
		'options.materialColor.b': 'Material color blue component',
		'options.materialColor.a': 'Material color alpha component',
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
		'options.*.input': 'Input method',
		'options.*.input.constant': 'none',
		'options.*.input.slider': 'slider',
		'options.*.input.mousemovex': 'mouse x axis',
		'options.*.input.mousemovey': 'mouse y axis',
		'options.*.input.gamepad0': 'gamepad 0 axis',
		'options.*.input.gamepad1': 'gamepad 1 axis',
		'options.*.input.gamepad2': 'gamepad 2 axis',
		'options.*.input.gamepad3': 'gamepad 3 axis',
		'options.*.range': 'with range',
		'options.*.speed.add': 'Add speed',
		'options.*.speed.remove': 'Remove speed',

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
		/*
		// TODO
		'controls.value.background.solid.color.r': 'Background color red component',
		'controls.value.background.solid.color.g': 'Background color green component',
		'controls.value.background.solid.color.b': 'Background color blue component',
		'controls.value.background.solid.color.a': 'Background color alpha component',
		'controls.value.shader.single.color.r': 'Fragment color red component',
		'controls.value.shader.single.color.g': 'Fragment color green component',
		'controls.value.shader.single.color.b': 'Fragment color blue component',
		'controls.value.shader.single.color.a': 'Fragment color alpha component',
		'controls.value.shape.gasket.depth': 'Sierpinski gasket recursion depth',
		'controls.value.animation.rotation.speed': 'Z axis rotation speed',
		*/
	}[id];
};
