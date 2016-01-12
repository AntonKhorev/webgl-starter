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
		const dims=['x','y','z'];
		const rotate=[[],[],[]];
		options.model.forEach(tr=>{
			if (tr.type=='rotate.x') {
				rotate[0].push(tr.value);
			} else if (tr.type=='rotate.y') {
				rotate[1].push(tr.value);
			} else if (tr.type=='rotate.z') {
				rotate[2].push(tr.value);
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
			const varName='rotate'+(nLayers>1?i:'');
			const htmlName='transforms.model.rotate'+(nLayers>1?'.'+i:'');
			if (isStraight) {
				const vector=new GlslVector('transforms.model.rotate',fixOptHelp.makeCollection(
					rotate.map(r=>r[i]).slice(0,lastStraightIndex+1),
					dims.slice(0,lastStraightIndex+1),
					Options
				));
				vector.varName=varName;
				vector.htmlName=htmlName;
				this.features.push(vector);
			} else {
				for (let j=0;j<3;j++) {
					const has=i<rotate[j].length;
					if (has) {
						const vector=new GlslVector('transforms.model.rotate',fixOptHelp.makeCollection(
							[rotate[j][i]],
							dims.slice(j,j+1),
							Options
						));
						vector.varName=varName;
						vector.htmlName=htmlName;
						this.features.push(vector);
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
