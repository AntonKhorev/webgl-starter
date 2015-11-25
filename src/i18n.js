module.exports=function(id){ // fake temporary i18n
	return {
		'message.hljs': "<a href='https://highlightjs.org/'>highlight.js</a> (hosted on cdnjs.cloudflare.com) is not loaded. Syntax highlighting is disabled.",
		'message.elements': "choosing 8- or 16-bit index may limit available shape detail levels",

		'options.general': 'General options',
		'options.background': 'Background',
		'options.background.none': 'None (transparent)',
		'options.background.solid': 'Solid color',
		'options.shader': 'Shader',
		'options.shader.single': 'Single color',
		'options.shader.vertex': 'One color per vertex',
		'options.shader.face': 'One color per face',
		'options.shader.light': 'Directional light',
		'options.shape': 'Shape to draw',
		'options.shape.square': 'Square',
		'options.shape.triangle': 'Triangle',
		'options.shape.gasket': 'Sierpinski gasket', // wp: Sierpinski triangle
		'options.shape.cube': 'Cube',
		'options.shape.hat': 'Mexican hat function', // wp: Mexican hat wavelet
		'options.shape.terrain': 'Diamond-square fractal terrain', // wp: Diamond-square algorithm
		'options.elements': 'Element array',
		'options.elements.0': 'not used',
		'options.elements.8': 'with 8-bit index',
		'options.elements.16': 'with 16-bit index',
		'options.elements.32': 'with 32-bit index',
		'options.projection': 'Projection',
		'options.projection.ortho': 'Orthogonal',
		'options.projection.perspective': 'Perspective',

		'options.input': 'Input options',
		'options.canvas.width': 'Canvas width',
		'options.canvas.height': 'Canvas height',
		'options.background.solid.color.r': 'Background color red component',
		'options.background.solid.color.g': 'Background color green component',
		'options.background.solid.color.b': 'Background color blue component',
		'options.background.solid.color.a': 'Background color alpha component',
		'options.shader.single.color.r': 'Fragment color red component',
		'options.shader.single.color.g': 'Fragment color green component',
		'options.shader.single.color.b': 'Fragment color blue component',
		'options.shader.single.color.a': 'Fragment color alpha component',
		'options.shape.lodShape.lod': 'Shape detail level', // recursion depth for fractal shapes
		'options.*.input': 'This value is',
		'options.*.input.constant': 'kept constant',
		'options.*.input.slider': 'updated with a slider',
		'options.*.input.mousemovex': 'updated by moving the mouse horizontally',
		'options.*.input.mousemovey': 'updated by moving the mouse vertically',
		'options.*.input.animated': 'animated',

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
		'options.indent.tab': 'Tab',
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
