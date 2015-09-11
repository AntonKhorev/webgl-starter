// var PRELINE=0;
var CanvasMousemoveListener=function() {
	this.entries=[];
};
CanvasMousemoveListener.prototype.enter=function(){
	var entry={
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
		pre: makePushArgs(entry.pre),
		cond: function(cond){ entry.cond=cond; },
		log: makePushArgs(entry.log),
		post: makePushArgs(entry.post),
	};
	return proxy;
};
CanvasMousemoveListener.prototype.write=function(haveToUpdateCanvas,haveToLogInput){
	function indent(line) {
		return "\t"+line;
	}
	var innerLines=[];
	this.entries.forEach(function(entry){
		innerLines=innerLines.concat(entry.pre);
		var condLines=[];
		if (haveToLogInput) {
			condLines=condLines.concat(entry.log);
		}
		condLines=condLines.concat(entry.post);
		if (haveToUpdateCanvas) {
			condLines.push("updateCanvas();"); // TODO do it once for all entries
		}
		if (entry.cond!==null) {
			if (condLines.length) {
				innerLines=innerLines.concat(
					["if ("+entry.cond+") {"],
					condLines.map(indent),
					["}"]
				);
			}
		} else {
			innerLines=innerLines.concat(condLines);
		}
	});
	if (innerLines.length) {
		return [].concat([
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();"
		],innerLines.map(indent),[
			"});"
		]);
	} else {
		return [];
	}
};

exports.CanvasMousemoveListener=CanvasMousemoveListener;
