var idCounter=0;
function generateId() {
	return 'webgl-starter-id-'+(idCounter++);
}

/*
function htmlEncode(value) {
	return value.toString()
		.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
		.replace(/</g,'&lt;').replace(/>/g,'&gt;')
	; // https://github.com/emn178/js-htmlencode/blob/master/src/htmlencode.js
}
*/

/*
var OptionsSection=function(){
	this.added=[];
};
OptionsSection.prototype.add=function(name,type){
	function getDefaultValue() {
		if (Array.isArray(type)) {
			return
		} else if (type=='bool') {
			return false;
		} else if (type=='color') {
			return {
				r: 1.0,
				g: 1.0,
				b: 1.0,
			};
		}
	}
	this.added.push({
		name: name,
		type: type,
		value: getDefaultValue(),
	});
};

var Options=function(){
	//this.fixed= // TODO stuff like language
	this.code=new OptionsSection();
	this.code.add('clearBackground','bool');
	this.code.add('draw',['triangle','gasket']);
	this.code.add('rotate','bool');
	this.inputs=new OptionsSection(); // TODO recreate based on this.code
	this.inputs.add('fragmentColor','color');
};
*/

var Options=require('./options.js');
var generateCode=require('./code.js');

function getHtmlDataUri(html) {
	// with base64: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa
	//return "data:text/html;charset=utf-8;base64,"+window.btoa(unescape(encodeURIComponent(str)));
	// without base64: https://en.wikipedia.org/wiki/Data_URI_scheme
	return 'data:text/html;charset=utf-8,'+encodeURIComponent(html);
}

var i18n=function(id){ // fake temporary i18n
	return {
		'options.general': 'General options',
		'options.background': 'Background',
		'options.background.none': 'None (transparent)',
		'options.background.solid': 'Solid color',
		'options.shape': 'Shape to draw',
		'options.shape.square': 'Square',
		'options.shape.triangle': 'Triangle',
		'options.shape.gasket': 'Sierpinski gasket', // wp: Sierpinski triangle
		'options.animation': 'Animation',
		'options.animation.none': 'None',
		'options.animation.rotation': 'Rotation around z axis',
	}[id];
};

$(function(){
	$('.webgl-starter').each(function(){
		var container=$(this);
		var options=new Options();
		var code;
		function updateCode() {
			code.text(generateCode(options));
			hljs.highlightBlock(code[0]);
		}
		function writeGeneralOption(option) {
			var id=generateId;
			return $("<div>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.name)+":</label>")
				.append(" ")
				.append(
					$("<select id='"+id+"'>").append(
						option.availableValues.map(function(availableValue){
							return $("<option>").val(availableValue).html(i18n('options.'+option.name+'.'+availableValue))
						})
					)
				)
		}
		container.empty().append(
			$("<fieldset>").append("<legend>"+i18n('options.general')+"</legend>").append(
				options.generalOptions.map(writeGeneralOption)
			)
		);
		/*
		container.empty().append(
			$("<div>").append(
				$("<label>").text(" Clear background").prepend(
					$("<input type='checkbox'>").change(function(){
						options.clearBackground=$(this).prop('checked');
						updateCode();
					})
				)
			)
		).append(
			$("<div>").append(
				$("<label>").text("Draw ").append(
					$("<select><option>square</option><option>triangle</option><option>gasket</option></select>").change(function(){
						options.draw=this.value;
						updateCode();
					})
				)
			)
		).append(
			$("<div>").append(
				$("<label>").text(" Animated rotation").prepend(
					$("<input type='checkbox'>").change(function(){
						options.rotate=$(this).prop('checked');
						updateCode();
					})
				)
			)
		).append(
			$("<div>").append(
				$("<label>").append("Fragment color: red 0% ").append(
					$("<input type='range' min='0' max='1' step='0.001' value='1'>").change(function(){
						options['fragmentColor.value.r']=parseFloat(this.value);
						updateCode();
					})
				).append(" 100%")
			)
		).append(
			$("<div>").append(
				$("<label>").append("Fragment color: green 0% ").append(
					$("<input type='range' min='0' max='1' step='0.001' value='0'>").change(function(){
						options['fragmentColor.value.g']=parseFloat(this.value);
						updateCode();
					})
				).append(" 100%")
			)
		).append(
			$("<div>").append(
				$("<label>").append("Fragment color: blue 0% ").append(
					$("<input type='range' min='0' max='1' step='0.001' value='0'>").change(function(){
						options['fragmentColor.value.b']=parseFloat(this.value);
						updateCode();
					})
				).append(" 100%")
			)
		).append(
			$("<div>").append(
				$("<label>").text(" Provide fragment color inputs to users").prepend(
					$("<input type='checkbox'>").change(function(){
						options['fragmentColor.input']=$(this).prop('checked');
						updateCode();
					})
				)
			)
		).append(
			$("<pre>").append(code=$("<code>").text(generateCode(options)))
		).append(
			$("<div>").append(
				$("<button type='button'>Run in new window</button>").click(function(){
					window.open(getHtmlDataUri(code.text()),"generatedCode");
				})
			).append(
				" running in new window doesn't work in Internet Explorer"
			)
		);
		hljs.highlightBlock(code[0]);
		*/
	});
});
