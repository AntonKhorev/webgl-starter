'use strict'

const Lines=require('crnx-base/lines')
const Feature=require('./feature')
const GlslVector=require('./glsl-vector')

class Transforms extends Feature {
	constructor(options) {
		super()
		this.options=options
		this.rotateVectorEntries=[] // [{vector,suffix}] like features, but vectors have additional methods that don't follow feature interfaces
		this.transformSequence=new Array(options.model.entries.length) // [{vector,component,suffix}]
		const possibleComponents=['x','y','z']
		const rotate=[[],[],[]]
		options.model.entries.forEach((tr,iTr)=>{
			const trData={
				transform: tr,
				index: iTr,
			}
			if (tr.type=='rotate.x') {
				rotate[0].push(trData)
			} else if (tr.type=='rotate.y') {
				rotate[1].push(trData)
			} else if (tr.type=='rotate.z') {
				rotate[2].push(trData)
			}
		})
		const nLayers=Math.max.apply(null,rotate.map(r=>r.length))
		for (let i=0;i<nLayers;i++) {
			let isInGap=false
			let isStraight=true
			let lastStraightIndex=-1
			for (let j=0;j<3;j++) {
				const has=i<rotate[j].length
				if (isInGap) {
					if (has) {
						isStraight=false
						break
					}
				} else {
					if (has) {
						lastStraightIndex=j
					} else {
						isInGap=true
					}
				}
			}
			const suffix=(nLayers>1?String(i):'')
			const makeVector=(values,names)=>{
				const vector=new GlslVector('rotate'+(nLayers>1?'.'+i:''),values,true)
				vector.i18nId='transforms.model.rotate'
				this.features.push(vector)
				this.rotateVectorEntries.push({
					vector,
					suffix,
				})
				return vector
			}
			const storeSequenceElement=(vector,j)=>{
				this.transformSequence[rotate[j][i].index]={
					vector,
					component: possibleComponents[j],
					suffix,
				}
			}
			if (isStraight) {
				const vector=makeVector(
					rotate.slice(0,lastStraightIndex+1).map(r=>r[i].transform),
					possibleComponents.slice(0,lastStraightIndex+1)
				)
				for (let j=0;j<=lastStraightIndex;j++) {
					storeSequenceElement(vector,j)
				}
			} else {
				for (let j=0;j<3;j++) {
					const has=i<rotate[j].length
					if (has) {
						const vector=makeVector(
							[rotate[j][i].transform],
							possibleComponents.slice(j,j+1)
						)
						storeSequenceElement(vector,j)
					}
				}
			}
		}
	}
	get eyeAtInfinity() {
		return this.options.projection=='ortho'
	}
	// private:
	use2dTransform(flatShape) { // has flat shape and exactly one z rotation TODO multiple z rotations
		return flatShape && this.options.model.length==1 && this.options.model[0].type=='rotate.z'
	}
	getTransformMatricesLines(dim) { // dim==3 for normal transform, dim==4 for position transform
		const a=Lines.ba("")
		const maxSuffixLength=1 // TODO calculate it
		const width=4+maxSuffixLength // 1(sign)+3(c.x)+(max suffix length)
		const pad=e=>{ // TODO (fake-)lodash pad
			if (e.length<width) {
				return ("          "+e).slice(-width)
			} else {
				return e
			}
		}
		const mat=(rows,comment)=>{
			a.t("*mat"+dim+"( // "+comment)
			rows.forEach((row,i)=>{
				if (i>=dim) return
				a("	")
				row.forEach((e,j)=>{
					if (j>=dim) return
					a.t(pad(e))
					if (i<dim-1 || j<dim-1) a.t(",")
				})
			})
			a(")")
		}
		this.transformSequence.forEach(ts=>{
			if (!ts) return
			const c=ts.vector.getGlslMapComponentValue('c'+ts.suffix,ts.component)
			const s=ts.vector.getGlslMapComponentValue('s'+ts.suffix,ts.component)
			if (ts.component=='x') {
				mat([
					["1.0","0.0","0.0","0.0"],
					["0.0",    c,"-"+s,"0.0"],
					["0.0",    s,    c,"0.0"],
					["0.0","0.0","0.0","1.0"],
				],"rotate around x axis")
			} else if (ts.component=='y') {
				mat([
					[    c,"0.0",    s,"0.0"],
					["0.0","1.0","0.0","0.0"],
					["-"+s,"0.0",    c,"0.0"],
					["0.0","0.0","0.0","1.0"],
				],"rotate around y axis")
			} else if (ts.component=='z') {
				mat([
					[    c,"-"+s,"0.0","0.0"],
					[    s,    c,"0.0","0.0"],
					["0.0","0.0","1.0","0.0"],
					["0.0","0.0","0.0","1.0"],
				],"rotate around z axis")
			}
		})
		if (dim==4 && this.options.projection=='perspective') {
			mat([
				["1.0","0.0","0.0","0.0"],
				["0.0","1.0","0.0","0.0"],
				["0.0","0.0","1.0","-(near+far)/2.0"],
				["0.0","0.0","0.0","1.0"],
			],"move center of coords inside view")
		}
		return a.e()
	}
	// public:
	getGlslVertexDeclarationLines(flatShape) {
		const a=Lines.b()
		this.rotateVectorEntries.forEach(rve=>{
			a(rve.vector.getGlslDeclarationLines())
		})
		if (this.use2dTransform(flatShape)) {
			a("attribute vec2 position;")
		} else {
			a("attribute vec4 position;")
		}
		return a.e()
	}
	getGlslVertexOutputLines(flatShape,receivesAspect,needTransformedPosition) {
		const a=Lines.b()
		this.rotateVectorEntries.forEach(rve=>{
			a(
				rve.vector.getGlslMapDeclarationLines('c'+rve.suffix,v=>`cos(radians(${v}))`),
				rve.vector.getGlslMapDeclarationLines('s'+rve.suffix,v=>`sin(radians(${v}))`)
			)
		})
		if (this.options.projection=='perspective') {
			a(
				"float fovy=45.0;",
				"float near=1.0/tan(radians(fovy)/2.0);",
				"float far=near+2.0;"
			)
		}
		if (needTransformedPosition) {
			a("vec4 transformedPosition=")
		} else {
			a("gl_Position=")
		}
		if (this.use2dTransform(flatShape)) {
			a.t(
				"vec4(position*mat2(",
				"	cz, -sz,",
				"	sz,  cz",
				"),0,1)"
			)
		} else {
			a.t("position")
			a.t(this.getTransformMatricesLines(4))
		}
		if (needTransformedPosition) {
			a.t(";")
			a("gl_Position=transformedPosition")
		}
		if (this.options.projection=='ortho') {
			if (receivesAspect) {
				a.t("*vec4(1.0/aspect,1.0,-1.0,1.0)") // correct aspect ratio and make coords right-handed
			} else if (!flatShape) {
				a.t("*vec4(1.0,1.0,-1.0,1.0)") // make coords right-handed for 3d shapes
			}
		} else if (this.options.projection=='perspective') {
			if (receivesAspect) {
				a.t(
					"*mat4(",
					"	near/aspect, 0.0,  0.0,                   0.0,",
					"	0.0,         near, 0.0,                   0.0,",
					"	0.0,         0.0,  (near+far)/(near-far), 2.0*near*far/(near-far),",
					"	0.0,         0.0,  -1.0,                  0.0",
					")"
				)
			} else {
				a.t(
					"*mat4(",
					"	near, 0.0,  0.0,                   0.0,",
					"	0.0,  near, 0.0,                   0.0,",
					"	0.0,  0.0,  (near+far)/(near-far), 2.0*near*far/(near-far),",
					"	0.0,  0.0,  -1.0,                  0.0",
					")"
				)
			}
		}
		a.t(";")
		return a.e()
	}
	getGlslVertexNormalTransformLines() {
		return this.getTransformMatricesLines(3)
	}
}

module.exports=Transforms
