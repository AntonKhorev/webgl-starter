var idCounter=0;
function generateId() {
	return 'webgl-starter-id-'+(idCounter++);
}

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
		'options.shader': 'Shader',
		'options.shader.single': 'Single color',
		'options.shader.vertex': 'One color per vertex',
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
		'options.background.solid.color.a': 'Background color alpha component',
		'options.shader.single.color.r': 'Fragment color red component',
		'options.shader.single.color.g': 'Fragment color green component',
		'options.shader.single.color.b': 'Fragment color blue component',
		'options.shader.single.color.a': 'Fragment color alpha component',
		'options.shape.gasket.depth': 'Sierpinski gasket recursion depth',
		'options.animation.rotation.speed': 'Z axis rotation speed',
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
			codeNode.text(generateCode(options.cloneWithoutHidden(),i18n));
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
				.append(" <span class='min'>"+option.getMinLabel()+"</span> ")
				.append(
					$("<input type='range' id='"+id+"'>")
						.attr('min',option.getMin())
						.attr('max',option.getMax())
						.attr('step',option.getStep())
						.val(options[option.name])
						.change(function(){
							options[option.name]=parseFloat(this.value);
							updateCode();
						})
				)
				.append(" <span class='max'>"+option.getMaxLabel()+"</span> ")
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
			$("<pre>").append(codeNode=$("<code>").text(generateCode(options.cloneWithoutHidden(),i18n)))
		);
		if (window.hljs) {
			hljs.highlightBlock(codeNode[0]);
		} else {
			containerNode.append("<p>"+i18n('message.hljs')+"</p>");
		}
		containerNode.append(
			$("<div>").append(
				$("<a download='source.html'><button type='button'>Save source code</button></a>").click(function(){
					// yes I want a button, but download attr is only available for links
					$(this).attr('href',getHtmlDataUri(codeNode.text()));
				})
			).append(
				" "
			).append(
				$("<button type='button'>Run in new window</button>").click(function(){
					window.open(getHtmlDataUri(codeNode.text()),"generatedCode");
				})
			).append(
				" these buttons don't work in Internet Explorer, copy-paste the code manually"
			)
		);
	});
});
