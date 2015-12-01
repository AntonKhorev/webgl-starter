var fs=require('fs');

module.exports=function(pageTitle,cssUrls,jsUrls){
	var templateCss=fs.readFileSync(__dirname+'/template.css','utf8');
	var packageJson=JSON.parse(fs.readFileSync('./package.json','utf8'));
	var allCssUrls=[].concat(cssUrls,['../../lib/'+packageJson.name+'.css']);
	var allJsUrls=['http://code.jquery.com/jquery-2.1.4.min.js'].concat(jsUrls,['../../lib/'+packageJson.name+'.js']);
	return [
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8'>",
		"<title>"+pageTitle+"</title>",
		allCssUrls.map(function(cssUrl){
			return "<link rel='stylesheet' href='"+cssUrl+"'>";
		}).join("\n"),
		allJsUrls.map(function(jsUrl){
			return "<script src='"+jsUrl+"'></script>";
		}).join("\n"),
		"<style>",
		templateCss.trim(),
		"</style>",
		"</head>",
		"<body>",
		"<nav>"+
		"<ul class='external'>"+
		"<li><a href='https://github.com/"+packageJson.repository+"'>source code</a></li>"+
		"<li><a href='"+packageJson.bugs.url+"'>report bugs</a></li>"+
		"</ul>"+
		"</nav>",
		"<div class='"+packageJson.name+"'>Javascript is disabled. This page requires javascript to function properly.</div>",
		"</body>",
		"</html>"
	].join("\n");
};
