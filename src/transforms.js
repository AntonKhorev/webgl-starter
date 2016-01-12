'use strict';

const Lines=require('./lines.js');
const Feature=require('./feature.js');

class Transforms extends Feature {
	constructor(options) {
		super();
		this.options=options;
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
