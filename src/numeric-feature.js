'use strict'

const formatNumbers=require('crnx-base/format-numbers')
const Input=require('./input-classes')
const Lines=require('crnx-base/lines')
const Feature=require('./feature')

class NumericFeature extends Feature {
	// private:
	getHtmlControlMessageForValue(i18n,value,name) {
		if (value.input instanceof Input.MouseMove) {
			return Lines.bae(
				"<li>"+i18n('controls.type.'+value.input)+" "+i18n('controls.to')+" <strong>"+i18n('options.'+name)+"</strong></li>"
			)
		} else {
			return Lines.be()
		}
	}
	getHtmlSliderLines(i18n,value,opName,htmlName,step) {
		const a=Lines.b()
		if (value.input=='slider') {
			const fmtAttrs=formatNumbers.html({ min:value.min, max:value.max, value:value.value },value.precision)
			const fmtLabels=formatNumbers({ min:value.min, max:value.max },value.precision)
			const minMax=n=>i18n.numberWithUnits(n,value.unit,(a,e)=>Lines.html`<abbr title=${e}>`+a+`</abbr>`)
			a(
				"<div>",
				Lines.html`	<label for=${htmlName}>${i18n(opName)}</label>`,
				"	<span class=min>"+minMax(fmtLabels.min)+"</span>",
				Lines.html`	<input type=range id=${htmlName} min=${fmtAttrs.min} max=${fmtAttrs.max} value=${fmtAttrs.value} step=${step}>`,
				"	<span class=max>"+minMax(fmtLabels.max)+"</span>",
				"</div>"
			)
		}
		return a.e()
	}
}

module.exports=NumericFeature
