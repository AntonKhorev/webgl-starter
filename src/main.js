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
		'message.hljs': "<a href='https://highlightjs.org/'>highlight.js</a> (hosted on cdnjs.cloudflare.com) is not loaded. Syntax highlighting is disabled.",

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

		'options.input': 'Input options',
		'options.background.solid.color.r': 'Background color red component',
		'options.background.solid.color.g': 'Background color green component',
		'options.background.solid.color.b': 'Background color blue component',
		'options.fragmentColor.r': 'Fragment color red component',
		'options.fragmentColor.g': 'Fragment color green component',
		'options.fragmentColor.b': 'Fragment color blue component',
		'options.*.input': 'Make this input available to users',
	}[id];
};

$(function(){
	$('.webgl-starter').each(function(){
		var containerNode=$(this);
		var optionsNode;
		var codeNode;
		var options=new Options();

		function showHideSuboptionInputs(optionName,optionValue) {
			// TODO sub-sub option support?
			optionsNode.find("[data-option^='"+optionName+".']").show()
				.not("[data-option^='"+optionName+"."+optionValue+".']").hide();
		}
		function updateCode() {
			codeNode.text(generateCode(options,i18n));
			if (window.hljs) hljs.highlightBlock(codeNode[0]);
		}
		function writeGeneralOption(option) {
			var id=generateId();
			return $("<div>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.name)+":</label>")
				.append(" ")
				.append(
					$("<select id='"+id+"'>").append(
						option.availableValues.map(function(availableValue){
							return $("<option>").val(availableValue).html(i18n('options.'+option.name+'.'+availableValue))
						})
					).val(options[option.name]).change(function(){
						options[option.name]=this.value;
						showHideSuboptionInputs(option.name,this.value);
						updateCode();
					})
				);
		}
		function writeInputOption(option) {
			var id=generateId();
			var checkboxId=generateId();
			return $("<div data-option='"+option.name+"'>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.name)+":</label>")
				.append(" "+option.availableValues[0]+" ")
				.append(
					$("<input type='range' id='"+id+"' step='any'>")
						.attr('min',option.availableValues[0])
						.attr('max',option.availableValues[1])
						.val(options[option.name])
						.change(function(){
							options[option.name]=parseFloat(this.value);
							updateCode();
						})
				)
				.append(" "+option.availableValues[1]+" ")
				.append(
					$("<input type='checkbox' id='"+checkboxId+"'>")
						.prop('checked',options[option.name+'.input'])
						.change(function(){
							options[option.name+'.input']=$(this).prop('checked');
							updateCode();
						})
				)
				.append(" ")
				.append("<label for='"+checkboxId+"'>"+i18n('options.*.input')+"</label>");
		}
		function writeOptions() {
			return $("<div>").append(
				$("<fieldset>").append("<legend>"+i18n('options.general')+"</legend>").append(
					options.generalOptions.map(writeGeneralOption)
				)
			).append(
				$("<fieldset>").append("<legend>"+i18n('options.input')+"</legend>").append(
					options.inputOptions.map(writeInputOption)
				)
			);
		}
		function hideSuboptionInputs() {
			options.generalOptions.forEach(function(option){
				showHideSuboptionInputs(option.name,options[options.name]);
			});
		}

		containerNode.empty().append(optionsNode=writeOptions());
		hideSuboptionInputs();
		containerNode.append(
			$("<pre>").append(codeNode=$("<code>").text(generateCode(options,i18n)))
		);
		if (window.hljs) {
			hljs.highlightBlock(codeNode[0]);
		} else {
			containerNode.append("<p>"+i18n('message.hljs')+"</p>");
		}
		containerNode.append(
			$("<div>").append(
				$("<button type='button'>Run in new window</button>").click(function(){
					window.open(getHtmlDataUri(codeNode.text()),"generatedCode");
				})
			).append(
				" running in new window doesn't work in Internet Explorer"
			)
		);
	});
});
