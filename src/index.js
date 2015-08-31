function htmlEncode(value) {
	return value.toString()
		.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
		.replace(/</g,'&lt;').replace(/>/g,'&gt;')
	; // https://github.com/emn178/js-htmlencode/blob/master/src/htmlencode.js
}

function generateCode() {
	return htmlEncode([
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
	].join("\n"));
}

$(function(){
	$('.webgl-starter').each(function(){
		var container=$(this);
		container.html("<code><pre>"+generateCode()+"</code></pre>");
	});
});
