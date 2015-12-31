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

	'options.light': "Light", // directional if on
	'options.light.type': "Light type",
	'options.light.type.off': "off",
	'options.light.type.phong': "on with Phong reflections", // wp: Phong reflection model
	'options.light.type.blinn': "on with Blinn–Phong reflections", // wp: Blinn–Phong shading model
	'options.light.direction': "Light direction",
	'options.light.direction.{x,y,z}': "Light direction {x,y,z} component",
	'options.light.direction.{x,y,z}.value': plainValue,
	'options.light.direction.{x,y,z}.speed': "Light direction {x,y,z} speed",
	'options.light.direction.{x,y,z}.speed.value': plainValue,

	'options.shape': "Shape",
	'options.shape.type': "Shape to draw",
	'options.shape.type.square': "square",
	'options.shape.type.triangle': "triangle",
	'options.shape.type.gasket': "Sierpinski gasket", // wp: Sierpinski triangle
	'options.shape.type.cube': "cube",
	'options.shape.type.hat': "Mexican hat function", // wp: Mexican hat wavelet
	'options.shape.type.terrain': "diamond-square fractal terrain", // wp: Diamond-square algorithm
	'options.shape.elements': "Element array",
	'options.shape.elements.0': "not used",
	'options.shape.elements.{8,16,32}': "with {8,16,32}-bit index",
	'options.shape.lod': "Shape detail level", // recursion depth for fractal shapes
	'options.shape.lod.value': plainValue,

	'options.transforms': "Transforms",
	'options.transforms.projection': "Projection",
	'options.transforms.projection.ortho': "orthogonal",
	'options.transforms.projection.perspective': "perspective",
	'options.transforms.model': "Model transform",
	'options.transforms.model.rotate{X,Y,Z}': "Add rotation around {x,y,z} axis",

	'options.debug': "Debug options",
	'options.debug.shaders': "Log shader compilation errors",
	'options.debug.arrays': "Log allocated array sizes",
	'options.debug.inputs': "Log input values",

	'options.formatting': "Code formatting options",
	'options.formatting.indent': "Indent",
	'options.formatting.indent.tab': "tab",
	'options.formatting.indent.{2,4,8}': "{2,4,8} spaces",

	'ui.inputs': "Input method",
	'ui.inputs.constant': "none",
	'ui.inputs.slider': "slider",
	'ui.inputs.mousemove{x,y}': "mouse {x,y} axis",
	'ui.inputs.gamepad{0,1,2,3}': "gamepad {0,1,2,3} axis",
	'ui.range': "with range",
	'ui.reset': "Reset",
	'ui.addSpeed': "Add speed",

	// TODO review strings below

	'options.rotate.x': 'Angle of rotation around x axis',
	'options.rotate.x.speed': 'Speed of rotation around x axis',
	'options.rotate.y': 'Angle of rotation around y axis',
	'options.rotate.y.speed': 'Speed of rotation around y axis',
	'options.rotate.z': 'Angle of rotation around z axis',
	'options.rotate.z.speed': 'Speed of rotation around z axis',

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
