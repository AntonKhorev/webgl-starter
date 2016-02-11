'use strict';

let idCounter=0;
function generateId() {
	return 'webgl-starter-id-'+(idCounter++);
}

const i18n=require('./i18n.js');
const Option=require('./option-classes.js');
const Options=require('./options.js');
const generateCode=require('./code.js');
const OptionsOutput=require('./options-output');

function getHtmlDataUri(html) {
	// with base64: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa
	//return "data:text/html;charset=utf-8;base64,"+window.btoa(unescape(encodeURIComponent(str)));
	// without base64: https://en.wikipedia.org/wiki/Data_URI_scheme
	return 'data:text/html;charset=utf-8,'+encodeURIComponent(html);
}

$(function(){
	$('.webgl-starter').each(function(){
		const $container=$(this);
		let $code;
		const options=new Options();
		const codeUpdateDelay=200;
		let codeUpdateTimeoutId=null;
		function updateCode() {
			clearTimeout(codeUpdateTimeoutId);
			codeUpdateTimeoutId=setTimeout(function(){
				$code.text(generateCode(options.fix(),i18n));
				if (window.hljs) hljs.highlightBlock($code[0]);
			},codeUpdateDelay);
		}
		options.updateCallback=updateCode;
		const optionsOutput=new OptionsOutput(options,generateId,i18n);
		function writeButtons() {
			return $("<div>").append(
				$("<a download='source.html'><button type='button'>Save source code</button></a>").click(function(){
					// yes I want a button, but download attr is only available for links
					$(this).attr('href',getHtmlDataUri($code.text()));
				})
			).append(
				" "
			).append(
				$("<button type='button'>Run in new window</button>").click(function(){
					window.open(getHtmlDataUri($code.text()),"generatedCode");
				})
			).append(
				" these buttons don't work in Internet Explorer, copy-paste the code manually"
			)
		}
		$container.empty().append(optionsOutput.$output);
		$container.append(writeButtons()).append(
			$("<pre>").append($code=$("<code>").text(generateCode(options.fix(),i18n)))
		);
		if (window.hljs) {
			hljs.highlightBlock($code[0]);
		} else {
			$container.append("<p>"+i18n('message.hljs')+"</p>");
		}
		$container.append(writeButtons());
	});
});
