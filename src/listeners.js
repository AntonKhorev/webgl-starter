var CanvasMousemoveListener=function() {
	this.entries=[];
};
CanvasMousemoveListener.prototype.enter=function(){
	var entry={
		state: [],
		pre: [],
		cond: undefined,
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
CanvasMousemoveListener.prototype.write=function(haveToUpdateCanvas,haveToLogInput){
	function indent(line) {
		return "\t"+line;
	}
	var outerLines=[];
	// TODO have to topologically sort inner lines - then can avoid (*)
	var innerLinesOrder=[];
	var innerLinesConds={};
	function addInnerLine(line,cond) {
		if (line in innerLinesConds) {
			// TODO move line to back? (*)
			if (cond===undefined) {
				innerLinesConds[line]=undefined;
			} else if (innerLinesConds[line]!==undefined) {
				innerLinesConds[line].push(cond);
			}
		} else {
			innerLinesOrder.push(line);
			innerLinesConds[line]=(cond===undefined ? [] : [cond]);
		}
	}
	function writeInnerLines() {
		var lines=[];
		var currentCond=undefined;
		innerLinesOrder.forEach(function(line){
			var newCond=undefined;
			if (innerLinesConds[line]!==undefined) {
				newCond=innerLinesConds[line].join(' || ');
			}
			if (newCond!=currentCond) {
				if (currentCond!==undefined) {
					lines.push("}");
				}
				currentCond=newCond;
				if (currentCond!==undefined) {
					lines.push("if ("+currentCond+") {");
				}
			}
			if (currentCond!==undefined) {
				lines.push(indent(line));
			} else {
				lines.push(line);
			}
		});
		if (currentCond!==undefined) {
			lines.push("}");
		}
		return lines;
	}
	this.entries.forEach(function(entry){
		outerLines=outerLines.concat(entry.state);
		entry.pre.forEach(addInnerLine);
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
	});
	var innerLines=writeInnerLines();
	if (innerLines.length) {
		return outerLines.concat([
			"canvas.addEventListener('mousemove',function(ev){",
			"	var rect=this.getBoundingClientRect();"
		],innerLines.map(indent),[
			"});"
		]);
	} else {
		return outerLines;
	}
};

exports.CanvasMousemoveListener=CanvasMousemoveListener;
