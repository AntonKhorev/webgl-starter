'use strict'

const escape=require('crnx-base/fake-lodash/escape')

let dataStrings={
	'options.canvas': "Canvas",
	'options.canvas.{width,height}': "Canvas {width,height}",

	'options.background': "Background",
	'options.background.type': "Background type",
	'options.background.type.none': "none (transparent)",
	'options.background.type.solid': "solid color",
	'options.background.color': "Background color",
	'options.background.color.{r,g,b,a}': 'Background color {red,green,blue,alpha} component',
	'options.background.color.{r,g,b,a}.speed': 'Background color {red,green,blue,alpha} speed',

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
	'options.material.color.{r,g,b,a}.speed': "Material color {red,green,blue,alpha} speed",
	'options.material.{specular,diffuse,ambient}Color': "Material {specular,diffuse,ambient} color",
	'options.material.{specular,diffuse,ambient}Color.{r,g,b}': "{Specular,Diffuse,Ambient} color {red,green,blue} component",
	'options.material.{specular,diffuse,ambient}Color.{r,g,b}.speed': "Material {specular,diffuse,ambient} color {red,green,blue,alpha} speed",

	'options.light': "Light", // directional if on
	'options.light.type': "Light type",
	'options.light.type.off': "off",
	'options.light.type.phong': "on with Phong reflections", // wp: Phong reflection model
	'options.light.type.blinn': "on with Blinn–Phong reflections", // wp: Blinn–Phong shading model
	'options.light.direction': "Light direction",
	'options.light.direction.{x,y,z}': "Light direction {x,y,z} component",
	'options.light.direction.{x,y,z}.speed': "Light direction {x,y,z} speed",

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

	'options.transforms': "Transforms",
	'options.transforms.projection': "Projection",
	'options.transforms.projection.ortho': "orthogonal",
	'options.transforms.projection.perspective': "perspective",
	'options.transforms.model': "Model transform",
	'options.transforms.model.rotate.{x,y,z}.add': "Add rotation around {x,y,z} axis",
	'options.transforms.model.rotate.{x,y,z}': "Angle of rotation around {x,y,z} axis",
	'options.transforms.model.rotate.{x,y,z}.speed': "Speed of rotation around {x,y,z} axis",

	'options.debug': "Debug options",
	'options.debug.shaders': "Log shader compilation errors",
	'options.debug.arrays': "Log allocated array sizes",
	'options.debug.inputs': "Log input values",
	'options.debug.animations': "Log animated values",

	'options.formatting': "Code formatting options",
	'options.formatting.indent': "Indent",
	'options.formatting.indent.tab': "tab",
	'options.formatting.indent.{2,4,8}': "{2,4,8} spaces",

	'options-output.inputs': "Input method",
	'options-output.inputs.constant': "none",
	'options-output.inputs.slider': "slider",
	'options-output.inputs.mousemove{x,y}': "mouse {x,y} axis",
	'options-output.inputs.gamepad{0,1,2,3}': "gamepad {0,1,2,3} axis",
	'options-output.range': "with range",
	'options-output.reset': "Reset",
	'options-output.addSpeed': "Add speed",
	'options-output.drag': "Drag or press up/down while in focus to reorder transforms",
	'options-output.delete': "Delete transform",
	'options-output.elements': "choosing 8- or 16-bit index may limit available shape detail levels",

	'controls.type.mousemovex': "Move the mouse pointer horizontally over the canvas",
	'controls.type.mousemovey': "Move the mouse pointer vertically over the canvas",
	'controls.to': "to update",

	'units.pixel.a': "px",
	'units.pixel.1': "pixel",
	'units.pixel.2': "pixels",
	'units.°/second.a': "°/s",
	'units.°/second.1': "degree per second",
	'units.°/second.2': "degrees per second",
	'units.second.a': "s",
	'units.1/second.1': "unit per second", // "inverse second",
	'units.1/second.2': "units per second", // "inverse seconds",
}

dataStrings=require('crnx-base/code-output-i18n')(dataStrings)

const strings={}
const expandRegexp=/^([^{]*)\{([^}]*)\}(.*)$/
function expandIdAndString(id,string) {
	let match
	if (match=expandRegexp.exec(id)) {
		const idStart=match[1]
		const idMids=match[2].split(',')
		const idEnd=match[3]
		if ((typeof string=='string') && (match=expandRegexp.exec(string))) {
			const stringStart=match[1]
			const stringMids=match[2].split(',')
			const stringEnd=match[3]
			idMids.forEach((idMid,i)=>{
				const stringMid=stringMids[i]
				expandIdAndString(idStart+idMid+idEnd,stringStart+stringMid+stringEnd)
			})
		} else {
			idMids.forEach(idMid=>{
				expandIdAndString(idStart+idMid+idEnd,string)
			})
		}
	} else {
		strings[id]=string
	}
}
for (let id in dataStrings) {
	expandIdAndString(id,dataStrings[id])
}

const i18n=function(id){
	if (strings[id]===undefined) {
		throw new Error("undefined string "+id)
	} if (typeof strings[id] == 'string') {
		return strings[id]
	}
}

i18n.number=function(n){
	return String(n).replace('-','−')
}

i18n.pluralSuffix=function(n){
	const ns=String(n)
	if (ns.indexOf('.')<0) {
		const nn=Number(n)
		if (Math.abs(nn)==1) {
			return '1'
		} else {
			return '2'
		}
	} else {
		return '2'
	}
}

i18n.plural=function(n,id){
	return this(id+'.'+this.pluralSuffix(n))
}

i18n.numberWithUnits=function(n,unit,abbrFn){
	if (abbrFn===undefined) { // codegen needs its own fn
		abbrFn=(abbr,expansion)=>"<abbr title='"+escape(expansion)+"'>"+abbr+"</abbr>" // expansion is html for stuff like s^(-1)
	}
	let s=this.number(n)
	if (unit!==undefined) {
		if (unit.length==1 && /^\W/.test(unit)) {
			s+=unit
		} else {
			s+=' ' // nbsp
			let abbr
			if (unit=='1/second') {
				abbr=i18n('units.second.a')+"<sup>−1</sup>"
			} else {
				abbr=i18n('units.'+unit+'.a')
			}
			const expansion=this.plural(n,'units.'+unit)
			s+=abbrFn(abbr,expansion)
		}
	}
	return s
}

module.exports=i18n
