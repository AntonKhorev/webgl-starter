'use strict';

const Options=require('./options.js');
const fixOptHelp=require('./fixed-options-helpers.js');
const Lines=require('./lines.js');
const Feature=require('./feature.js');
const GlslVector=require('./glsl-vector.js');

class Transforms extends Feature {
	constructor(options) {
		super();
		this.options=options;
		this.rotateVectorEntries=[]; // [{vector,suffix}] like features, but vectors have additional methods that don't follow feature interfaces
		this.transformSequence=new Array(options.model.length); // [{vector,component,suffix}]
		const possibleComponents=['x','y','z'];
		const rotate=[[],[],[]];
		options.model.forEach((tr,iTr)=>{
			const trData={
				transform: tr.value,
				index: iTr,
			};
			if (tr.type=='rotate.x') {
				rotate[0].push(trData);
			} else if (tr.type=='rotate.y') {
				rotate[1].push(trData);
			} else if (tr.type=='rotate.z') {
				rotate[2].push(trData);
			}
		});
		const nLayers=Math.max.apply(null,rotate.map(r=>r.length));
		for (let i=0;i<nLayers;i++) {
			let isInGap=false;
			let isStraight=true;
			let lastStraightIndex=-1;
			for (let j=0;j<3;j++) {
				const has=i<rotate[j].length;
				if (isInGap) {
					if (has) {
						isStraight=false;
						break;
					}
				} else {
					if (has) {
						lastStraightIndex=j;
					} else {
						isInGap=true;
					}
				}
			}
			const suffix=(nLayers>1?String(i):'');
			const makeVector=(values,names)=>{
				const vector=new GlslVector('transforms.model.rotate',fixOptHelp.makeCollection(values,names,Options));
				vector.varName='rotate'+suffix;
				vector.htmlName='transforms.model.rotate'+(nLayers>1?'.'+i:'');
				this.features.push(vector);
				this.rotateVectorEntries.push({
					vector: vector,
					suffix: suffix,
				});
				return vector;
			};
			const storeSequenceElement=(vector,j)=>{
				this.transformSequence[rotate[j][i].index]={
					vector: vector,
					component: possibleComponents[j],
					suffix: suffix,
				};
			};
			if (isStraight) {
				const vector=makeVector(
					rotate.slice(0,lastStraightIndex+1).map(r=>r[i].transform),
					possibleComponents.slice(0,lastStraightIndex+1)
				);
				for (let j=0;j<=lastStraightIndex;j++) {
					storeSequenceElement(vector,j);
				}
			} else {
				for (let j=0;j<3;j++) {
					const has=i<rotate[j].length;
					if (has) {
						const vector=makeVector(
							[rotate[j][i].transform],
							possibleComponents.slice(j,j+1)
						);
						storeSequenceElement(vector,j);
					}
				}
			}
		}
	}
	// private:
	use2dTransform(flatShape) { // has flat shape and exactly one z rotation TODO multiple z rotations
		return flatShape && this.options.model.length==1 && this.options.model[0].type=='rotate.z';
	}
	// public:
	getGlslVertexDeclarationLines(flatShape) {
		const lines=new Lines;
		this.rotateVectorEntries.forEach(rve=>{
			lines.a(rve.vector.getGlslDeclarationLines())
		});
		if (this.use2dTransform(flatShape)) {
			lines.a("attribute vec2 position;");
		} else {
			lines.a("attribute vec4 position;");
		}
		return lines;
	}
	getGlslVertexOutputLines(flatShape,needTransformedPosition) {
		const lines=new Lines;
		this.rotateVectorEntries.forEach(rve=>{
			lines.a(
				rve.vector.getGlslMapDeclarationLines('c'+rve.suffix,v=>`cos(radians(${v}))`),
				rve.vector.getGlslMapDeclarationLines('s'+rve.suffix,v=>`sin(radians(${v}))`)
			);
		});
		if (this.options.projection=='perspective') {
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
		if (this.use2dTransform(flatShape)) {
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
			const maxSuffixLength=1; // TODO calculate it
			const width=4+maxSuffixLength; // 1(sign)+3(c.x)+(max suffix length)
			const pad=e=>{
				if (e.length<width) {
					return ("          "+e).slice(-width);
				} else {
					return e;
				}
			};
			const mat=(rows)=>{
				const dim=rows.length;
				lines.t("*mat"+dim+"(");
				rows.forEach((row,i)=>{
					lines.a("	");
					row.forEach((e,j)=>{
						lines.t(pad(e));
						if (i<dim-1 || j<dim-1) lines.t(",");
					});
				});
				lines.a(")");
			};
			this.transformSequence.forEach(ts=>{
				if (!ts) return;
				const c=ts.vector.getGlslMapComponentValue('c'+ts.suffix,ts.component);
				const s=ts.vector.getGlslMapComponentValue('s'+ts.suffix,ts.component);
				if (ts.component=='x') {
					mat([
						["1.0","0.0","0.0","0.0"],
						["0.0",    c,"-"+s,"0.0"],
						["0.0",    s,    c,"0.0"],
						["0.0","0.0","0.0","1.0"],
					]);
				} else if (ts.component=='y') {
					mat([
						[    c,"0.0",    s,"0.0"],
						["0.0","1.0","0.0","0.0"],
						["-"+s,"0.0",    c,"0.0"],
						["0.0","0.0","0.0","1.0"],
					]);
				} else if (ts.component=='z') {
					mat([
						[    c,"-"+s,"0.0","0.0"],
						[    s,    c,"0.0","0.0"],
						["0.0","0.0","1.0","0.0"],
						["0.0","0.0","0.0","1.0"],
					]);
				}
			});
			if (this.options.projection=='perspective') {
				mat([
					["1.0","0.0","0.0","0.0"],
					["0.0","1.0","0.0","0.0"],
					["0.0","0.0","1.0","-(near+far)/2.0"],
					["0.0","0.0","0.0","1.0"],
				]);
			}
		}
		return lines;
	}
}

module.exports=Transforms;
