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
		this.vectors=[]; // like features, but vectors have additional methods that don't follow feature interfaces
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
		const transformSequence=new Array(options.model.length); // [{vector,component}]
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
			const makeVector=(values,names)=>{
				const vector=new GlslVector('transforms.model.rotate',fixOptHelp.makeCollection(values,names,Options));
				vector.varName='rotate'+(nLayers>1?i:'');
				vector.htmlName='transforms.model.rotate'+(nLayers>1?'.'+i:'');
				this.features.push(vector);
				this.vectors.push(vector);
				return vector;
			};
			if (isStraight) {
				const vector=makeVector(
					rotate.slice(0,lastStraightIndex+1).map(r=>r[i].transform),
					possibleComponents.slice(0,lastStraightIndex+1)
				);
				for (let j=0;j<=lastStraightIndex;j++) {
					transformSequence[rotate[j][i].index]={
						vector: vector,
						component: possibleComponents[j]
					};
				}
			} else {
				for (let j=0;j<3;j++) {
					const has=i<rotate[j].length;
					if (has) {
						const vector=makeVector(
							[rotate[j][i].transform],
							possibleComponents.slice(j,j+1)
						);
						transformSequence[rotate[j][i].index]={
							vector: vector,
							component: possibleComponents[j]
						};
					}
				}
			}
		}
	}
	// private:
	use2dTransform(flatShape) { // has flat shape and exactly one z rotation TODO multiple z rotations
		return flatShape && this.options.model.length==1 && this.options.model[0].type=='rotateZ';
	}
	// public:
	getGlslVertexDeclarationLines(flatShape) {
		const lines=new Lines;
		this.vectors.forEach(vector=>{
			lines.a(vector.getGlslDeclarationLines())
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
		return lines;
	}
}

module.exports=Transforms;
