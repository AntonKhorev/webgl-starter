'use strict'

let idCounter=0
function generateId() {
	return 'webgl-starter-id-'+(idCounter++)
}

const i18ns=require('./i18n')
const Options=require('./options')
const Code=require('./code')
const OptionsOutput=require('./options-output')
const CodeOutput=require('crnx-base/code-output')

$(function(){
	$('.webgl-starter').each(function(){
		const $container=$(this)
		const lang=$container.closest('[lang]').attr('lang')
		const i18n=i18ns(lang)
		const options=new Options()
		const codeOutput=new CodeOutput(()=>new Code(options.fix(),i18n),i18n)
		options.updateCallback=codeOutput.update
		const optionsOutput=new OptionsOutput(options,generateId,i18n)
		$container.empty().append(
			optionsOutput.$output,
			codeOutput.$output
		)
	})
})
