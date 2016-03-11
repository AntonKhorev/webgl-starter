'use strict'

const Option=require('./option-classes')
const BaseOptionsOutput=require('crnx-base/options-output')

class OptionsOutput extends BaseOptionsOutput {
	setOptionClassWriters(optionClassWriters) {
		super.setOptionClassWriters(optionClassWriters)
		const baseSelectWriter=optionClassWriters.get(Option.Select)
		optionClassWriters.set(Option.Select,(option,writeOption,i18n,generateId)=>{
			const $option=baseSelectWriter(option,writeOption,i18n,generateId)
			if (option.name=='elements') {
				$option.append(" "+i18n('options-output.elements'))
			}
			return $option
		})
		optionClassWriters.set(Option.LiveNumber,(option,writeOption,i18n,generateId)=>{
			const writeSubOption=option=>{
				const p=option.precision
				const setInputAttrs=$input=>$input
					.attr('min',option.availableMin)
					.attr('max',option.availableMax)
					.attr('step',Math.pow(0.1,p).toFixed(p))
				const setInputAttrsAndListeners=($input,getOtherInput)=>setInputAttrs($input)
					.val(option.value)
					.on('input change',function(){
						if (this.checkValidity()) {
							const $that=getOtherInput()
							$that.val(this.value)
							option.value=parseFloat(this.value)
						}
					})
				const writeMinMaxInput=minOrMax=>setInputAttrs($("<input type='number' required>"))
					.val(option[minOrMax])
					.on('input change',function(){
						if (this.checkValidity()) {
							option[minOrMax]=parseFloat(this.value)
						}
					})
				const id=generateId()
				const inputSelectId=generateId()
				let $sliderInput,$numberInput,$inputSelect
				let $rangeMinInput,$rangeMaxInput
				return $("<div class='option'>").append("<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label>")
					.append(" <span class='min'>"+i18n(`options.${option.fullName}.value`,option.availableMin)+"</span> ")
					.append($sliderInput=setInputAttrsAndListeners(
						$("<input type='range' id='"+id+"'>"),
						()=>$numberInput
					))
					.append(" <span class='max'>"+i18n(`options.${option.fullName}.value`,option.availableMax)+"</span> ")
					.append($numberInput=setInputAttrsAndListeners(
						$("<input type='number' required>"),
						()=>$sliderInput
					))
					.append(" <label for='"+inputSelectId+"'>"+i18n('options-output.inputs')+":</label> ")
					.append(
						$inputSelect=$("<select id='"+inputSelectId+"'>").append(
							option.availableInputTypes.map(availableInputType=>
								$("<option>").val(availableInputType).html(i18n('options-output.inputs.'+availableInputType))
							)
						).val(option.input).change(function(){
							option.input=this.value
						})
					)
					.append(" ")
					.append(
						option.$range=$("<span class='range'>")
							.append(i18n('options-output.range')+" ")
							.append($rangeMinInput=writeMinMaxInput('min'))
							.append(" .. ")
							.append($rangeMaxInput=writeMinMaxInput('max'))
					)
					.append(" ")
					.append(
						$("<button type='button'>"+i18n('options-output.reset')+"</button>").click(function(){
							$sliderInput.val(option.defaultValue).change()
							$inputSelect.val('constant').change()
							$rangeMinInput.val(option.availableMin).change()
							$rangeMaxInput.val(option.availableMax).change()
						})
					)
			}
			if (option instanceof Option.LiveFloat) {
				return option.$=$("<div>")
					.append(
						writeSubOption(option)
						.append(" ")
						.append(
							option.$addSpeed=$("<label> "+i18n('options-output.addSpeed')+"</label>").prepend(
								$("<input type='checkbox'>")
									.prop('checked',option.addSpeed)
									.change(function(){
										option.addSpeed=this.checked
									})
							)
						)
					)
					.append(option.speed.$=writeSubOption(option.speed))
			} else {
				return option.$=writeSubOption(option)
			}
		})
	}
}

module.exports=OptionsOutput
