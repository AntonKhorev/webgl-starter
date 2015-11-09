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
		'options.shader.face': 'One color per face',
		'options.shader.light': 'Directional light',
		'options.shape': 'Shape to draw',
		'options.shape.square': 'Square',
		'options.shape.triangle': 'Triangle',
		'options.shape.gasket': 'Sierpinski gasket', // wp: Sierpinski triangle
		'options.shape.cube': 'Cube',
		'options.shape.hat': 'Mexican hat function', // wp: Mexican hat wavelet
		'options.projection': 'Projection',
		'options.projection.ortho': 'Orthogonal',
		'options.projection.perspective': 'Perspective',

		'options.input': 'Input options',
		'options.canvas.width': 'Canvas width',
		'options.canvas.height': 'Canvas height',
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
		'options.*.input': 'This value is',
		'options.*.input.constant': 'kept constant',
		'options.*.input.slider': 'updated with a slider',
		'options.*.input.mousemovex': 'updated by moving the mouse horizontally',
		'options.*.input.mousemovey': 'updated by moving the mouse vertically',
		'options.*.input.animated': 'animated',

		'options.transform': 'Transforms',
		'options.rotate.x': 'Angle of rotation around x axis',
		'options.rotate.x.speed': 'Speed of rotation around x axis',
		'options.rotate.y': 'Angle of rotation around y axis',
		'options.rotate.y.speed': 'Speed of rotation around y axis',
		'options.rotate.z': 'Angle of rotation around z axis',
		'options.rotate.z.speed': 'Speed of rotation around z axis',

		'options.debug': 'Debug options',
		'options.debugShader': 'Log shader compilation errors',
		'options.debugInputs': 'Log input values',

		'controls.type.mousemovex': 'Move the mouse pointer horizontally over the canvas',
		'controls.type.mousemovey': 'Move the mouse pointer vertically over the canvas',
		'controls.to': 'to update',
		/*
		// TODO
		'controls.value.background.solid.color.r': 'Background color red component',
		'controls.value.background.solid.color.g': 'Background color green component',
		'controls.value.background.solid.color.b': 'Background color blue component',
		'controls.value.background.solid.color.a': 'Background color alpha component',
		'controls.value.shader.single.color.r': 'Fragment color red component',
		'controls.value.shader.single.color.g': 'Fragment color green component',
		'controls.value.shader.single.color.b': 'Fragment color blue component',
		'controls.value.shader.single.color.a': 'Fragment color alpha component',
		'controls.value.shape.gasket.depth': 'Sierpinski gasket recursion depth',
		'controls.value.animation.rotation.speed': 'Z axis rotation speed',
		*/
	}[id];
};

$(function(){
	$('.webgl-starter').each(function(){
		var $container=$(this);
		var $options;
		var $code;
		var options=new Options();
		var codeUpdateTimeoutId=null;
		var codeUpdateDelay=200;

		function showHideSuboptionInputs(optionName,optionValue) {
			// TODO sub-sub option support?
			$options.find("[data-option^='"+optionName+".']").show()
				.not("[data-option^='"+optionName+"."+optionValue+".']").hide();
		}
		function updateCode() {
			clearTimeout(codeUpdateTimeoutId);
			codeUpdateTimeoutId=setTimeout(function(){
				$code.text(generateCode(options.fix(),i18n));
				if (window.hljs) hljs.highlightBlock($code[0]);
			},codeUpdateDelay);
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
			var inputId=generateId();
			var sliderInput,numberInput;
			function inputListener(that) {
				if (this.checkValidity()) {
					that.val(this.value);
					options[option.name]=parseFloat(this.value);
					updateCode();
				}
			}
			return $("<div data-option='"+option.name+"'>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.name)+":</label>")
				.append(" <span class='min'>"+option.getMinLabel()+"</span> ")
				.append(
					sliderInput=$("<input type='range' id='"+id+"'>")
						.attr('min',option.getMin())
						.attr('max',option.getMax())
						.attr('step',option.getSetupStep())
						.val(options[option.name])
						.on('input change',function(){
							inputListener.call(this,numberInput);
						})
				)
				.append(" <span class='max'>"+option.getMaxLabel()+"</span> ")
				.append(
					numberInput=$("<input type='number' required>")
						.attr('min',option.getMin())
						.attr('max',option.getMax())
						.attr('step',option.getSetupStep())
						.val(options[option.name])
						.on('input change',function(){
							inputListener.call(this,sliderInput);
						})
				)
				.append(" ")
				.append(
					$("<button type='button'>Reset</button>").click(function(){
						sliderInput.val(option.defaultValue).change();
					})
				)
				.append(" ")
				.append("<label for='"+inputId+"'>"+i18n('options.*.input')+"</label> ")
				.append(
					$("<select id='"+inputId+"'>").append(
						option.availableInputTypes.map(function(availableInputType){
							return $("<option>").val(availableInputType).html(i18n('options.*.input.'+availableInputType))
						})
					).val(options[option.name+'.input']).change(function(){
						options[option.name+'.input']=this.value;
						updateCode();
					})
				);
		}
		function writeDebugOption(option) {
			var id=generateId();
			return $("<div>")
				.append(
					$("<input type='checkbox' id='"+id+"'>")
						.prop('checked',options[option.name])
						.change(function(){
							options[option.name]=$(this).prop('checked');
							updateCode();
						})
				)
				.append(" <label for='"+id+"'>"+i18n('options.'+option.name)+"</label>");
		}
		function makeSortable($sortableRoot,callback) {
			// have to make drag handler 'draggable', not the whole item
			// because inputs and labels don't like to be inside 'draggable'
			// http://stackoverflow.com/questions/13017177/selection-disabled-while-using-html5-drag-and-drop
			var $dragged=null;
			$sortableRoot.children().prepend(
				$("<div draggable='true' tabindex='0' title='Drag or press up/down while in focus to reorder transforms'>").on('dragstart',function(ev){
					$dragged=$(this).parent();
					ev.originalEvent.dataTransfer.effectAllowed='move';
					ev.originalEvent.dataTransfer.setData('Text',name);
					if (ev.originalEvent.dataTransfer.setDragImage) { // doesn't work in IE
						ev.originalEvent.dataTransfer.setDragImage($dragged[0],0,0);
					}
					setTimeout(function(){
						$dragged.addClass('ghost');
					},0);
				})
				.keydown(function(ev){
					var $handle=$(this);
					var $sorted=$handle.parent();
					if (ev.keyCode==38) {
						$sorted.prev().before($sorted);
						$handle.focus();
						callback();
						return false;
					} else if (ev.keyCode==40) {
						$sorted.next().after($sorted);
						$handle.focus();
						callback();
						return false;
					}
				})
			).on('dragover',function(ev){
				ev.preventDefault();
				ev.originalEvent.dataTransfer.dropEffect='move';
				var $target=$(this);
				if ($dragged) {
					if ($target.nextAll().is($dragged)) {
						$target.before($dragged);
						callback();
					} else if ($target.prevAll().is($dragged)) {
						$target.after($dragged);
						callback();
					}
				}
			}).on('drop',function(ev){
				ev.preventDefault();
			}).on('dragend',function(ev){
				ev.preventDefault();
				if ($dragged) {
					$dragged.removeClass('ghost');
					$dragged=null;
				}
			});
		}
		function writeOptions() {
			var $transforms;
			var $options=$("<div>").append(
				$("<fieldset>").append("<legend>"+i18n('options.general')+"</legend>").append(
					options.generalOptions.map(writeGeneralOption)
				)
			).append(
				$("<fieldset>").append("<legend>"+i18n('options.input')+"</legend>").append(
					options.inputOptions.map(writeInputOption)
				)
			).append(
				$("<fieldset>").append("<legend>"+i18n('options.transform')+"</legend>").append(
					$transforms=$("<div>").append(
						options.transforms.map(function(transform){
							return $("<div class='transform' data-transform='"+transform.name+"'>").append(
								transform.options.map(writeInputOption)
							);
						})
					)
				)
			).append(
				$("<fieldset>").append("<legend>"+i18n('options.debug')+"</legend>").append(
					options.debugOptions.map(writeDebugOption)
				)
			);
			makeSortable($transforms,function(){
				options.transformOrder=$transforms.children().map(function(){
					return $(this).attr('data-transform');
				}).get();
				updateCode();
			});
			return $options;
		}
		function hideSuboptionInputs() {
			options.generalOptions.forEach(function(option){
				showHideSuboptionInputs(option.name,options[option.name]);
			});
		}
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

		$container.empty().append($options=writeOptions());
		hideSuboptionInputs();
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
