var fs=require('fs');

exports.css=fs.readFileSync(__dirname+'/navbar.css','utf8');

exports.generateHtml=function(){
	var packageJson=JSON.parse(fs.readFileSync('./package.json','utf8'));
	return ""+
		"<nav>"+
		"<ul class='external'>"+
		"<li><a href='https://github.com/"+packageJson.repository+"'>source code</a></li>"+
		"<li><a href='"+packageJson.bugs.url+"'>report bugs</a></li>"+
		"</ul>"+
		"</nav>"
	;
};
