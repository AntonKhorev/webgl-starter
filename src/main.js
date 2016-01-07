'use strict';

let idCounter=0;
function generateId() {
	return 'webgl-starter-id-'+(idCounter++);
}

const i18n=require('./i18n.js');
const Option=require('./option-classes.js');
const Options=require('./options.js');
const generateCode=require('./code.js');

function getHtmlDataUri(html) {
	// with base64: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa
	//return "data:text/html;charset=utf-8;base64,"+window.btoa(unescape(encodeURIComponent(str)));
	// without base64: https://en.wikipedia.org/wiki/Data_URI_scheme
	return 'data:text/html;charset=utf-8,'+encodeURIComponent(html);
}

$(function(){
	$('.webgl-starter').each(function(){
		const $container=$(this);
		let $options,$code;
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
		function writeOption(option) {
			if (option instanceof Option.Root) {
				return option.$=$("<div>").append(
					option.entries.map(writeOption)
				);
			} else if (option instanceof Option.Group) {
				return option.$=$("<fieldset>").append("<legend>"+i18n('options.'+option.fullName)+"</legend>").append(
					option.entries.map(writeOption)
				);
			} else if (option instanceof Option.Checkbox) {
				const id=generateId();
				return option.$=$("<div>")
					.append(
						$("<input type='checkbox' id='"+id+"'>")
							.prop('checked',option.value)
							.change(function(){
								option.value=$(this).prop('checked');
							})
					)
					.append(" <label for='"+id+"'>"+i18n('options.'+option.fullName)+"</label>");
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
						})
					);
				if (option.name=='elements') {
					option.$.append(" "+i18n('message.elements'));
				}
				return option.$;
			} else if (option instanceof Option.LiveNumber) {
				const writeOption=option=>{
					const setInputAttrs=$input=>$input
						.attr('min',option.availableMin)
						.attr('max',option.availableMax)
						.attr('step',option.step);
					const setInputAttrsAndListeners=($input,getOtherInput)=>setInputAttrs($input)
						.val(option.value)
						.on('input change',function(){
							if (this.checkValidity()) {
								const $that=getOtherInput();
								$that.val(this.value);
								option.value=parseFloat(this.value);
							}
						});
					const writeMinMaxInput=minOrMax=>setInputAttrs($("<input type='number' required>"))
						.val(option[minOrMax])
						.on('input change',function(){
							if (this.checkValidity()) {
								option[minOrMax]=parseFloat(this.value);
							}
						});
					const id=generateId();
					const inputSelectId=generateId();
					let $sliderInput,$numberInput,$inputSelect;
					let $rangeMinInput,$rangeMaxInput;
					return $("<div>").append("<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label>")
						.append(" <span class='min'>"+i18n(`options.${option.fullName}.value`,option.availableMin)+"</span> ")
						.append($sliderInput=setInputAttrsAndListeners(
							$("<input type='range' id='"+id+"'>"),
							()=>$numberInput
						))
						.append(" <span class='max'>"+i18n(`options.${option.fullName}.value`,option.availableMax)+"</span> ")
						.append($numberInput=setInputAttrsAndListeners(
							$("<input type='number' required>"),
							()=>$sliderInput
						))
						.append(" <label for='"+inputSelectId+"'>"+i18n('ui.inputs')+":</label> ")
						.append(
							$inputSelect=$("<select id='"+inputSelectId+"'>").append(
								option.availableInputTypes.map(availableInputType=>
									$("<option>").val(availableInputType).html(i18n('ui.inputs.'+availableInputType))
								)
							).val(option.input).change(function(){
								option.input=this.value;
							})
						)
						.append(" ")
						.append(
							option.$range=$("<span class='range'>")
								.append(i18n('ui.range')+" ")
								.append($rangeMinInput=writeMinMaxInput('min'))
								.append(" .. ")
								.append($rangeMaxInput=writeMinMaxInput('max'))
						)
						.append(" ")
						.append(
							$("<button type='button'>"+i18n('ui.reset')+"</button>").click(function(){
								$sliderInput.val(option.defaultValue).change();
								$inputSelect.val('constant').change();
								$rangeMinInput.val(option.availableMin).change();
								$rangeMaxInput.val(option.availableMax).change();
							})
						);
				};
				option.$=writeOption(option);
				if (option instanceof Option.LiveFloat) {
					option.$.append(
						option.$addSpeed=$("<label> "+i18n('ui.addSpeed')+"</label>").prepend(
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
			} else if (option instanceof Option.Array) {
				let $dragged=null;
				let $entries;
				const updateArrayEntries=()=>{
					option.entries=$entries.children().map(function(){
						return $(this).data('option');
					}).get();
				};
				const writeDraggableOption=option=>{
					// have to make drag handler 'draggable', not the whole item
					// because inputs and labels don't like to be inside 'draggable'
					// http://stackoverflow.com/questions/13017177/selection-disabled-while-using-html5-drag-and-drop
					return $("<div class='draggable-with-handle'>")
						.data('option',option)
						.append(
							$("<div draggable='true' tabindex='0' title='"+i18n('ui.drag')+"'>")
								.on('dragstart',function(ev){
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
									const $handle=$(this);
									const $sorted=$handle.parent();
									if (ev.keyCode==38) {
										$sorted.prev().before($sorted);
										$handle.focus();
										updateArrayEntries();
										return false;
									} else if (ev.keyCode==40) {
										$sorted.next().after($sorted);
										$handle.focus();
										updateArrayEntries();
										return false;
									}
								})
						)
						.append(writeOption(option))
						.append(
							$("<div tabindex='0' class='delete' title='"+i18n('ui.delete')+"'>×</div>")
								.click(function(){
									$(this).parent().remove();
									updateArrayEntries();
								})
								.keydown(function(ev){
									if (ev.keyCode==13 || ev.keyCode==32) {
										$(this).parent().remove();
										updateArrayEntries();
										return false;
									}
								})
						)
						.on('dragover',function(ev){
							ev.preventDefault();
							ev.originalEvent.dataTransfer.dropEffect='move';
							const $target=$(this);
							if ($dragged) {
								if ($target.nextAll().is($dragged)) {
									$target.before($dragged);
									updateArrayEntries();
								} else if ($target.prevAll().is($dragged)) {
									$target.after($dragged);
									updateArrayEntries();
								}
							}
						})
						.on('drop',function(ev){
							ev.preventDefault();
						})
						.on('dragend',function(ev){
							ev.preventDefault();
							if ($dragged) {
								$dragged.removeClass('ghost');
								$dragged=null;
							}
						});
				};
				option.$=$("<fieldset>").append("<legend>"+i18n('options.'+option.fullName)+"</legend>")
					.append(
						$entries=$("<div>")
							.append(option.entries.map(writeDraggableOption))
					);
				const $buttons=$("<div>");
				option.availableTypes.forEach((type,i)=>{
					if (i) $buttons.append(" ");
					$buttons.append(
						$("<button type='button'>")
							.html(i18n('options.'+option.fullName+'.'+type+'.add'))
							.click(function(){
								const entry=option.addEntry(type);
								$entries.append(writeDraggableOption(entry));
							})
					);
				});
				option.$.append($buttons);
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
