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
		};
	}
	var proxy={
		state: makePushArgs(entry.state),
		pre: makePushArgs(entry.pre),
		cond: function(cond){ entry.cond=cond; },
		log: makePushArgs(entry.log),
		post: makePushArgs(entry.post),
	};
	return proxy;
};
Listener.prototype.write=function(haveToUpdateCanvas,haveToLogInput){
	function indent(line) {
		return "\t"+line;
	}
	var outerLines=[];
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
				lines.push(indent(line));
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
		return lines;
	}
	this.entries.forEach(function(entry){
		outerLines=outerLines.concat(entry.state);
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
			addInnerLine("updateCanvas();",entry.cond);
		}
		closeEntryInnerLines();
	});
	var innerLines=writeInnerLines();
	if (innerLines.length) {
		return outerLines.concat(
			this.writeListenerStart(),
			innerLines.map(indent),
			this.writeListenerEnd()
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
SliderListener.prototype.writeListenerStart=function(){
	return [
		"document.getElementById('"+this.id+"').addEventListener('change',function(){",
	];
};
SliderListener.prototype.writeListenerEnd=function(){
	return [
		"});",
	];
};

var CanvasMousemoveListener=function(){
	Listener.call(this);
};
CanvasMousemoveListener.prototype=Object.create(Listener.prototype);
CanvasMousemoveListener.prototype.constructor=CanvasMousemoveListener;
CanvasMousemoveListener.prototype.writeListenerStart=function(){
	return [
		"canvas.addEventListener('mousemove',function(ev){",
		"	var rect=this.getBoundingClientRect();",
	];
};
CanvasMousemoveListener.prototype.writeListenerEnd=function(){
	return [
		"});",
	];
};

exports.SliderListener=SliderListener;
exports.CanvasMousemoveListener=CanvasMousemoveListener;
