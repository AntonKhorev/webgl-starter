/*
function htmlEncode(value) {
	return value.toString()
		.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
		.replace(/</g,'&lt;').replace(/>/g,'&gt;')
	; // https://github.com/emn178/js-htmlencode/blob/master/src/htmlencode.js
}
*/

function generateCode() {
	return [
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>Generated code</title>",
		"</head>",
		"<body>",
		"Generated code!",
		"</body>",
		"</html>",
	].join("\n");
}

function getHtmlDataUri(html) {
	// with base64: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa
	//return "data:text/html;charset=utf-8;base64,"+window.btoa(unescape(encodeURIComponent(str)));
	// without base64: https://en.wikipedia.org/wiki/Data_URI_scheme
	return 'data:text/html;charset=utf-8,'+encodeURIComponent(html);
}

$(function(){
	$('.webgl-starter').each(function(){
		var container=$(this);
		var code;
		//container.html("<code><pre>"+generateCode()+"</code></pre>");
		container.empty().append(
			$("<code>").append(code=$("<pre>").text(generateCode()))
		).append(
			$("<button type='button'>Run</button>").click(function(){
				//window.open("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==","generatedCode");
				window.open(getHtmlDataUri(code.text()),"generatedCode");
			})
		);
	});
});
