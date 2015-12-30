'use strict';

var idCounter=0;
function generateId() {
	return 'webgl-starter-id-'+(idCounter++);
}

var i18n=require('./i18n.js');
var Option=require('./option-classes.js');
var Options=require('./options.js');
//var generateCode=require('./code.js');

function getHtmlDataUri(html) {
	// with base64: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa
	//return "data:text/html;charset=utf-8;base64,"+window.btoa(unescape(encodeURIComponent(str)));
	// without base64: https://en.wikipedia.org/wiki/Data_URI_scheme
	return 'data:text/html;charset=utf-8,'+encodeURIComponent(html);
}

$(function(){
	$('.webgl-starter').each(function(){
		var $container=$(this);
		var $options;
		var $code;
		var options=new Options();
		var codeUpdateTimeoutId=null;
		var codeUpdateDelay=200;

		/*
		function showHideSuboptionInputs(changedOption) {
			options.inputOptions.forEach(function(affectedOption){
				if (affectedOption.isVisibilityAffectedBy(changedOption)) {
					$options.find("[data-option='"+affectedOption.name+"']").toggle(
						affectedOption.isVisible(options)
					);
				}
			});
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
			var $option=$("<div>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.name)+":</label>")
				.append(" ")
				.append(
					$("<select id='"+id+"'>").append(
						option.availableValues.map(function(availableValue){
							return $("<option>").val(availableValue).html(i18n('options.'+option.name+'.'+availableValue))
						})
					).val(options[option.name]).change(function(){
						options[option.name]=this.value;
						showHideSuboptionInputs(option);
						updateCode();
					})
				);
			if (option.name=='elements') {
				$option.append(" "+i18n('message.elements'));
			}
			return $option;
		}
		function writeInputOption(option,withRange,withGamepad) {
			var id=generateId();
			var inputId=generateId();
			var $sliderInput,$numberInput;
			var $inputSelect;
			var $rangeSpan,$rangeMinInput,$rangeMaxInput;
			var availableInputTypes=option.availableInputTypes;
			if (withGamepad) {
				availableInputTypes=availableInputTypes.concat(option.availableGamepadInputTypes);
			}
			function inputListener(that) {
				if (this.checkValidity()) {
					that.val(this.value);
					options[option.name]=parseFloat(this.value);
					updateCode();
				}
			}
			function minMaxInput(minOrMax) {
				return $("<input type='number' required>")
					.attr('min',option.getMin())
					.attr('max',option.getMax())
					.attr('step',option.getSetupStep())
					.val(options[option.name+'.'+minOrMax])
					.on('input change',function(){
						if (this.checkValidity()) {
							options[option.name+'.'+minOrMax]=parseFloat(this.value);
							updateCode();
						}
					});
			}
			var $optionDiv=$("<div data-option='"+option.name+"'>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.name)+":</label>")
				.append(" <span class='min'>"+option.getMinLabel()+"</span> ")
				.append(
					$sliderInput=$("<input type='range' id='"+id+"'>")
						.attr('min',option.getMin())
						.attr('max',option.getMax())
						.attr('step',option.getSetupStep())
						.val(options[option.name])
						.on('input change',function(){
							inputListener.call(this,$numberInput);
						})
				)
				.append(" <span class='max'>"+option.getMaxLabel()+"</span> ")
				.append(
					$numberInput=$("<input type='number' required>")
						.attr('min',option.getMin())
						.attr('max',option.getMax())
						.attr('step',option.getSetupStep())
						.val(options[option.name])
						.on('input change',function(){
							inputListener.call(this,$sliderInput);
						})
				)
				.append(" ")
				.append("<label for='"+inputId+"'>"+i18n('options.*.input')+":</label> ")
				.append(
					$inputSelect=$("<select id='"+inputId+"'>").append(
						availableInputTypes.map(function(availableInputType){
							return $("<option>").val(availableInputType).html(i18n('options.*.input.'+availableInputType))
						})
					).val(options[option.name+'.input']).change(function(){
						options[option.name+'.input']=this.value;
						if (withRange) {
							if (this.value=='constant') {
								$rangeSpan.hide();
							} else {
								$rangeSpan.show();
							}
						}
						if (withGamepad) {
							$options.find("[data-option='"+option.name+'.speed'+"']")
								.toggle(option.availableGamepadInputTypes.indexOf(this.value)<0);
						}
						updateCode();
					})
				);
			if (withRange) {
				$optionDiv.append(" ").append(
					$rangeSpan=$("<span class='range'>")
						.append(i18n('options.*.range')+" ")
						.append($rangeMinInput=minMaxInput('min'))
						.append(" .. ")
						.append($rangeMaxInput=minMaxInput('max'))
				);
				if ($inputSelect.val()=='constant') {
					$rangeSpan.hide();
				}
			}
			$optionDiv.append(" ")
				.append(
					$("<button type='button'>Reset</button>").click(function(){
						if (withRange) {
							$rangeMinInput.val(option.getMin());
							$rangeMaxInput.val(option.getMax());
						}
						$sliderInput.val(option.defaultValue).change();
						$inputSelect.val('constant').change();
					})
				);
			return $optionDiv;
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
					options.inputOptions.map(function(option){
						return writeInputOption(option,true,false)
					})
				)
			).append(
				$("<fieldset>").append("<legend>"+i18n('options.transform')+"</legend>").append(
					$transforms=$("<div>").append(
						options.transforms.map(function(transform){
							return $("<div class='transform' data-transform='"+transform.name+"'>").append(
								transform.options.map(function(option,i){
									return writeInputOption(option,false,i==0) // gamepad only for value (not speed) option
								})
							);
						})
					)
				)
			).append(
				$("<fieldset>").append("<legend>"+i18n('options.debug')+"</legend>").append(
					options.debugOptions.map(writeDebugOption)
				)
			).append(
				$("<fieldset>").append("<legend>"+i18n('options.formatting')+"</legend>").append(
					options.formattingOptions.map(writeGeneralOption)
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
			options.inputOptions.forEach(function(affectedOption){
				$options.find("[data-option='"+affectedOption.name+"']").toggle(
					affectedOption.isVisible(options)
				);
			});
		}
		*/
		function writeOption(option) {
			if (option instanceof Option.Root) {
				return option.$=$("<div>").append(
					option.entries.map(writeOption)
				);
			} else if (option instanceof Option.Group) {
				return option.$=$("<fieldset>").append("<legend>"+i18n('options.'+option.fullName)+"</legend>").append(
					option.entries.map(writeOption)
				);
			} else if (option instanceof Option.Select) {
				const id=generateId();
				option.$=$("<div>")
					.append("<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label>")
					.append(" ")
					.append(
						$("<select id='"+id+"'>").append(
							option.availableValues.map(function(availableValue){
								return $("<option>").val(availableValue).html(i18n('options.'+option.fullName+'.'+availableValue))
							})
						).val(option.value).change(function(){
							option.value=this.value;
							//updateCode(); // TODO callback for options
						})
					);
				if (option.name=='elements') {
					option.$.append(" "+i18n('message.elements'));
				}
				return option.$;
			} else if (option instanceof Option.RangeInput) {
				const writeOption=option=>{
					const id=generateId();
					let $sliderInput;
					return $("<div>").append("<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label>")
						.append(" ")
						.append(" <span class='min'>"+i18n('options.'+option.fullName+'.value',option.availableMin)+"</span> ")
						.append(
							$sliderInput=$("<input type='range' id='"+id+"'>")
								.attr('min',option.availableMin)
								.attr('max',option.availableMax)
								.attr('step',option.step)
								.val(option.value)
								//.on('input change',function(){
								//	inputListener.call(this,$numberInput);
								//})
						)
						.append(" <span class='max'>"+i18n('options.'+option.fullName+'.value',option.availableMax)+"</span> ")
					;
				};
				option.$=writeOption(option);
				if (option instanceof Option.LiveFloat) {
					option.$.append(
						$("<label> add speed</label>").prepend( // TODO i18n
							$("<input type='checkbox'>")
								.prop('checked',option.addSpeed)
								.change(function(){
									option.addSpeed=this.checked;
								})
						)
					);
					option.$.append(" ").append(option.speed.$=writeOption(option.speed));
				}
				return option.$;
			}
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

		$container.empty().append($options=writeOption(options.root));
		//hideSuboptionInputs();
		$container.append(writeButtons()).append(
			//$("<pre>").append($code=$("<code>").text(generateCode(options.fix(),i18n)))
			$("<pre>").append($code=$("<code>").text("TODO code"))
		);
		if (window.hljs) {
			hljs.highlightBlock($code[0]);
		} else {
			$container.append("<p>"+i18n('message.hljs')+"</p>");
		}
		$container.append(writeButtons());
	});
});
