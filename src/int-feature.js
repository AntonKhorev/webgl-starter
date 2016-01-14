'use strict';

const NumericFeature=require('./numeric-feature.js');

class IntFeature extends NumericFeature {
	constructor(name,value) {
		super();
		this.name=name;
		this.value=value;
	}
	hasInputs() {
		return super.hasInputs() || this.value.input!='constant';
	}
	requestFeatureContext(featureContext) {
		super.requestFeatureContext(featureContext);
		if (this.value.input!='constant') {
			featureContext.hasInputs=true;
		}
		if (this.value.input=='slider') {
			featureContext.hasSliders=true;
		}
	}
	getHtmlControlMessageLines(i18n) {
		const lines=super.getHtmlControlMessageLines(i18n);
		lines.a(
			this.getHtmlControlMessageForValue(i18n,this.value,this.name)
		);
		return lines;
	}
	getHtmlInputLines(i18n) {
		const lines=super.getHtmlInputLines(i18n);
		const v=this.value;
		if (v.input=='slider') {
			lines.a(
				"<div>",
				"	<label for='"+this.name+"'>"+i18n('options.'+this.name)+":</label>",
				"	<span class='min'>"+i18n('options.'+this.name+'.value',v.min)+"</span>",
				"	<input type='range' id='"+this.name+"' min='"+v.min+"' max='"+v.max+"' value='"+v+"' />",
				"	<span class='max'>"+i18n('options.'+this.name+'.value',v.max)+"</span>",
				"</div>"
			);
		}
		return lines;
	}
}

module.exports=IntFeature;
