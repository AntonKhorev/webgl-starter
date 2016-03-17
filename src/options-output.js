'use strict'

const Option=require('./option-classes')
const BaseOptionsOutput=require('crnx-base/options-output')

class OptionsOutput extends BaseOptionsOutput {
	setOptionClassWriters(optionClassWriters) {
		super.setOptionClassWriters(optionClassWriters)
		const baseSelectWriter=optionClassWriters.get(Option.Select)
		optionClassWriters.set(Option.LiveNumber,(option,writeOption,i18n,generateId)=>{
			const writeSubOption=option=>{
				const p=option.precision
				const setInputAttrs=$input=>$input
					.attr('min',option.availableMin)
					.attr('max',option.availableMax)
					.attr('step',Math.pow(0.1,p).toFixed(p))
				const writeMinMaxInput=minOrMax=>setInputAttrs($("<input type='number' required>"))
					.val(option[minOrMax])
					.on('input change',function(){
						if (this.checkValidity()) {
							option[minOrMax]=parseFloat(this.value)
						}
					})
				const id=generateId()
				const inputSelectId=generateId()
				let $inputSelect,$rangeMinInput,$rangeMaxInput
				const $output=optionClassWriters.get(Option.Number)(option,writeOption,i18n,generateId)
				$output.find('button').before(
					" <label for='"+inputSelectId+"'>"+i18n('options-output.inputs')+":</label> ",
					$inputSelect=$("<select id='"+inputSelectId+"'>").append(
						option.availableInputTypes.map(availableInputType=>
							$("<option>").val(availableInputType).html(i18n('options-output.inputs.'+availableInputType))
						)
					).val(option.input).change(function(){
						option.input=this.value
					}),
					" ",
					option.$range=$("<span class='range'>")
						.append(i18n('options-output.range')+" ")
						.append($rangeMinInput=writeMinMaxInput('min'))
						.append(" .. ")
						.append($rangeMaxInput=writeMinMaxInput('max')),
					" "
				).click(function(){
					$inputSelect.val('constant').change()
					$rangeMinInput.val(option.availableMin).change()
					$rangeMaxInput.val(option.availableMax).change()
				})
				return $output
			}
			if (option instanceof Option.LiveFloat) {
				return option.$=$("<div>").append(
					writeSubOption(option).append(
						" ",
						option.$addSpeed=$("<label> "+i18n('options-output.addSpeed')+"</label>").prepend(
							$("<input type='checkbox'>")
								.prop('checked',option.addSpeed)
								.change(function(){
									option.addSpeed=this.checked
								})
						)
					),
					option.speed.$=writeSubOption(option.speed)
				)
			} else {
				return option.$=writeSubOption(option)
			}
		})
	}
}

module.exports=OptionsOutput
