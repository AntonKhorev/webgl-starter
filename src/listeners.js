var Lines=require('./lines.js');

var Listener=function(){
	this.entries=[];
};
Listener.prototype.enter=function(){
	var entry={
		state: [],
		pre: [],
		cond: null,
		log: [],
		post: [],
	};
	this.entries.push(entry);
	function makePushArgs(where) {
		return function() {
			for (var i=0;i<arguments.length;i++) {
				where.push(arguments[i]);
			}
			return proxy;
		};
	}
	var proxy={
		state: makePushArgs(entry.state),
		pre: makePushArgs(entry.pre),
		cond: function(cond){
			entry.cond=cond;
			return proxy;
		},
		log: makePushArgs(entry.log),
		post: makePushArgs(entry.post),
	};
	return proxy;
};
Listener.prototype.innerPrependedLines=function(){
	return [];
};
Listener.prototype.bracketFnArg=function(){
	return "";
};
Listener.prototype.wrapCall=function(line){
	return line;
};
Listener.prototype.write=function(haveToUpdateCanvas,haveToLogInput){
	var outerLines=new Lines;
	var innerLinesGraph={};
	var innerLinesRoot=[];
	var innerLinesPrev=null;
	var WHITE=0;
	var GRAY=1;
	var BLACK=2;
	function addInnerLine(line,cond) {
		var vertex;
		if (line in innerLinesGraph) {
			vertex=innerLinesGraph[line];
		} else {
			vertex=innerLinesGraph[line]={
				prevs: [],
				conds: [],
				mark: WHITE,
			};
		}
		if (vertex.conds!==null) {
			if (cond===null) {
				vertex.conds=null;
			} else {
				vertex.conds.push(cond);
			}
		}
		if (innerLinesPrev!==null) {
			vertex.prevs.push(innerLinesPrev);
		}
		innerLinesPrev=line;
	}
	function closeEntryInnerLines() {
		if (innerLinesPrev!==null) {
			innerLinesRoot.push(innerLinesPrev);
		}
		innerLinesPrev=null;
	}
	function writeInnerLines() {
		var lines=[];
		var currentCond=null;
		function writeLine(line,vertex) {
			var newCond=null;
			if (vertex.conds!==null) {
				newCond=vertex.conds.join(' || ');
			}
			if (newCond!=currentCond) {
				if (currentCond!==null) {
					lines.push("}");
				}
				currentCond=newCond;
				if (currentCond!==null) {
					lines.push("if ("+currentCond+") {");
				}
			}
			if (currentCond!==null) {
				lines.push('\t'+line);
			} else {
				lines.push(line);
			}
		}
		function recVertex(line,vertex) {
			vertex.mark=GRAY;
			recPrevs(vertex.prevs);
			vertex.mark=BLACK;
			writeLine(line,vertex);
		}
		function recPrevs(prevs) {
			prevs.forEach(function(line){
				if (innerLinesGraph[line].mark==WHITE) {
					recVertex(line,innerLinesGraph[line]);
				}
			});
		}
		recPrevs(innerLinesRoot);
		if (currentCond!==null) {
			lines.push("}");
		}
		return new Lines(lines);
	}
	this.entries.forEach(function(entry){
		outerLines.a(entry.state);
		entry.pre.forEach(function(line){
			addInnerLine(line,null);
		});
		if (haveToLogInput) {
			entry.log.forEach(function(line){
				addInnerLine(line,entry.cond);
			});
		}
		entry.post.forEach(function(line){
			addInnerLine(line,entry.cond);
		});
		if (haveToUpdateCanvas) {
			addInnerLine("scheduleFrame();",entry.cond);
		}
		closeEntryInnerLines();
	});
	var br=this.bracketListener();
	var innerLines=writeInnerLines();
	if (!innerLines.isEmpty()) {
		innerLines=new Lines(
			this.innerPrependedLines(),
			innerLines
		);
	}
	if (innerLines.data.length==1) {
		var match=/^(\w+)\(\);$/.exec(innerLines.data[0]);
		if (match) {
			return outerLines.a(
				this.wrapCall(
					new Lines(
						br[0]+match[1]+br[1]
					)
				)
			);
		}
		// TODO what if no match?
	}
	if (innerLines.data.length) {
		return outerLines.a(
			this.wrapCall(
				innerLines.wrap(
					br[0]+"function("+this.bracketFnArg()+"){",
					"}"+br[1]
				)
			)
		);
	} else {
		return outerLines;
	}
};

var SliderListener=function(id){
	Listener.call(this);
	this.id=id;
};
SliderListener.prototype=Object.create(Listener.prototype);
SliderListener.prototype.constructor=SliderListener;
SliderListener.prototype.bracketListener=function(){
	return ["document.getElementById('"+this.id+"').addEventListener('change',",");"];
};

var MultipleSliderListener=function(query){
	Listener.call(this);
	this.query=query;
};
MultipleSliderListener.prototype=Object.create(Listener.prototype);
MultipleSliderListener.prototype.constructor=MultipleSliderListener;
MultipleSliderListener.prototype.wrapCall=function(lines){
	return lines.wrap(
		"[].forEach.call(document.querySelectorAll('"+this.query+"'),function(el){",
		"});"
	);
};
MultipleSliderListener.prototype.bracketListener=function(){
	return ["el.addEventListener('change',",");"];
};

var CanvasMousemoveListener=function(){
	Listener.call(this);
};
CanvasMousemoveListener.prototype=Object.create(Listener.prototype);
CanvasMousemoveListener.prototype.constructor=CanvasMousemoveListener;
CanvasMousemoveListener.prototype.enter=function(){
	var proxy=Listener.prototype.enter.call(this);
	proxy.prexy=function(inputType,xLine,yLine){
		if (inputType=='mousemovex') {
			return proxy.pre(xLine);
		} else if (inputType=='mousemovey') {
			return proxy.pre(yLine);
		}
		return proxy;
	};
	proxy.minMaxFloat=function(inputType,varName,minValue,maxValue){
		var VarName=varName.charAt(0).toUpperCase()+varName.slice(1);
		proxy.pre("var min"+VarName+"="+minValue+";");
		proxy.pre("var max"+VarName+"="+maxValue+";");
		return proxy.prexy(
			inputType,
			varName+"=min"+VarName+"+(max"+VarName+"-min"+VarName+")*(ev.clientX-rect.left)/(rect.width-1);",
			varName+"=min"+VarName+"+(max"+VarName+"-min"+VarName+")*(rect.bottom-1-ev.clientY)/(rect.height-1);"
		);
	};
	return proxy;
};
CanvasMousemoveListener.prototype.bracketListener=function(){
	return ["canvas.addEventListener('mousemove',",");"];
};
CanvasMousemoveListener.prototype.bracketFnArg=function(){
	return "ev";
};
CanvasMousemoveListener.prototype.innerPrependedLines=function(){
	return [
		"var rect=this.getBoundingClientRect();",
	];
};

exports.SliderListener=SliderListener;
exports.MultipleSliderListener=MultipleSliderListener;
exports.CanvasMousemoveListener=CanvasMousemoveListener;
