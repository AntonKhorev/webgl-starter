'use strict';

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

const dataStrings={
	'message.hljs': "<a href='https://highlightjs.org/'>highlight.js</a> (hosted on cdnjs.cloudflare.com) is not loaded. Syntax highlighting is disabled.",
	'message.elements': "choosing 8- or 16-bit index may limit available shape detail levels",

	'options.canvas': "Canvas",
	'options.canvas.{width,height}': "Canvas {width,height}",
	'options.canvas.{width,height}.value': pixelValue,

	'options.background': "Background",
	'options.background.type': "Background type",
	'options.background.type.none': "none (transparent)",
	'options.background.type.solid': "solid color",
	'options.background.color': "Background color",
	'options.background.color.{r,g,b,a}': 'Background color {red,green,blue,alpha} component',
	'options.background.color.{r,g,b,a}.value': plainValue,
	'options.background.color.{r,g,b,a}.speed': 'Background color {red,green,blue,alpha} speed',
	'options.background.color.{r,g,b,a}.speed.value': plainValue,

	'options.material': "Material",
	'options.material.scope': "Set material color for objects",
	'options.material.scope.global': "entire scene",
	'options.material.scope.vertex': "shape vertices",
	'options.material.scope.face': "shape faces",
	'options.material.data': "For each object have",
	'options.material.data.one': "one color",
	'options.material.data.sda': "specular/diffuse/ambient colors",
	'options.material.color': "Material color",
	'options.material.color.{r,g,b,a}': "Material color {red,green,blue,alpha} component",
	'options.material.color.{r,g,b,a}.value': plainValue,
	'options.material.color.{r,g,b,a}.speed': "Material color {red,green,blue,alpha} speed",
	'options.material.color.{r,g,b,a}.speed.value': plainValue,
	'options.material.{specular,diffuse,ambient}Color': "Material {specular,diffuse,ambient} color",
	'options.material.{specular,diffuse,ambient}Color.{r,g,b}': "{Specular,Diffuse,Ambient} color {red,green,blue} component",
	'options.material.{specular,diffuse,ambient}Color.{r,g,b}.value': plainValue,
	'options.material.{specular,diffuse,ambient}Color.{r,g,b}.speed': "Material {specular,diffuse,ambient} color {red,green,blue,alpha} speed",
	'options.material.{specular,diffuse,ambient}Color.{r,g,b}.speed.value': plainValue,

	'ui.inputs': "Input method",
	'ui.inputs.constant': "none",
	'ui.inputs.slider': "slider",
	'ui.inputs.mousemove{x,y}': "mouse {x,y} axis",
	'ui.inputs.gamepad{0,1,2,3}': "gamepad {0,1,2,3} axis",
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

const strings={};
const expandRegexp=/^([^{]*)\{([^}]*)\}(.*)$/;
function expandIdAndString(id,string) {
	let match;
	if (match=expandRegexp.exec(id)) {
		const idStart=match[1];
		const idMids=match[2].split(',');
		const idEnd=match[3];
		if ((typeof string=='string') && (match=expandRegexp.exec(string))) {
			const stringStart=match[1];
			const stringMids=match[2].split(',');
			const stringEnd=match[3];
			idMids.forEach((idMid,i)=>{
				const stringMid=stringMids[i];
				expandIdAndString(idStart+idMid+idEnd,stringStart+stringMid+stringEnd);
			});
		} else {
			idMids.forEach(idMid=>{
				expandIdAndString(idStart+idMid+idEnd,string);
			});
		}
	} else {
		strings[id]=string;
	}
}
for (let id in dataStrings) {
	expandIdAndString(id,dataStrings[id]);
}

module.exports=function(id,n){
	if (strings[id]===undefined) {
		throw new Error("undefined string "+id);
	} if (typeof strings[id] == 'string') {
		return strings[id];
	} else {
		return strings[id](n);
	}
};
