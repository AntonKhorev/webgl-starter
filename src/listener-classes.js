'use strict';

const Lines=require('crnx-base/lines');

class Base {
	constructor() {
		this.entries=[];
	}
	enter() {
		const entry={
			pre: [],
			cond: null,
			log: [],
			post: [],
		};
		this.entries.push(entry);
		function makePushArgs(where){
			return function(){
				for (let i=0;i<arguments.length;i++) {
					where.push(arguments[i]);
				}
				return proxy;
			};
		}
		const proxy={
			pre: makePushArgs(entry.pre),
			cond: function(cond){
				entry.cond=cond;
				return proxy;
			},
			log: makePushArgs(entry.log),
			post: makePushArgs(entry.post),
		};
		return proxy;
	}
	innerPrependedLines() {
		return [];
	}
	bracketFnArg() {
		return "";
	}
	wrapCall(line) {
		return line;
	}
	write(haveToUpdateCanvas,haveToLogInput) {
		const innerLinesGraph={};
		const innerLinesRoot=[];
		let innerLinesPrev=null;
		const WHITE=0;
		const GRAY=1;
		const BLACK=2;
		const addInnerLine=(line,cond)=>{
			let vertex;
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
		};
		const closeEntryInnerLines=()=>{
			if (innerLinesPrev!==null) {
				innerLinesRoot.push(innerLinesPrev);
			}
			innerLinesPrev=null;
		};
		const writeInnerLines=()=>{
			const lines=[];
			let currentCond=null;
			const writeLine=(line,vertex)=>{
				let newCond=null;
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
			};
			const recVertex=(line,vertex)=>{
				vertex.mark=GRAY;
				recPrevs(vertex.prevs);
				vertex.mark=BLACK;
				writeLine(line,vertex);
			};
			const recPrevs=(prevs)=>{
				prevs.forEach((line)=>{
					if (innerLinesGraph[line].mark==WHITE) {
						recVertex(line,innerLinesGraph[line]);
					}
				});
			};
			recPrevs(innerLinesRoot);
			if (currentCond!==null) {
				lines.push("}");
			}
			return new Lines(lines);
		};
		this.entries.forEach((entry)=>{
			entry.pre.forEach(line=>{
				addInnerLine(line,null);
			});
			if (haveToLogInput) {
				entry.log.forEach(line=>{
					addInnerLine(line,entry.cond);
				});
			}
			entry.post.forEach(line=>{
				addInnerLine(line,entry.cond);
			});
			if (haveToUpdateCanvas) {
				addInnerLine("scheduleFrame();",entry.cond);
			}
			closeEntryInnerLines();
		});
		const br=this.bracketListener();
		let innerLines=writeInnerLines();
		if (!innerLines.isEmpty()) {
			innerLines=new Lines(
				this.innerPrependedLines(),
				innerLines
			);
		}
		if (innerLines.data.length==1) {
			const match=/^(\w+)\(\);$/.exec(innerLines.data[0]);
			if (match) {
				return this.wrapCall(
					new Lines(
						br[0]+match[1]+br[1]
					)
				);
			}
			// TODO what if no match?
		}
		if (innerLines.data.length) {
			return this.wrapCall(
				innerLines.wrap(
					br[0]+"function("+this.bracketFnArg()+"){",
					"}"+br[1]
				)
			);
		} else {
			return new Lines;
		}
	}
}

class Slider extends Base {
	constructor(id) {
		super();
		this.id=id;
	}
	bracketListener() {
		return ["document.getElementById('"+this.id+"').addEventListener('change',",");"];
	}
}

class MultipleSlider extends Base {
	constructor(query) {
		super();
		this.query=query;
	}
	wrapCall(lines) {
		return lines.wrap(
			"[].forEach.call(document.querySelectorAll('"+this.query+"'),function(el){",
			"});"
		);
	}
	bracketListener() {
		return ["el.addEventListener('change',",");"];
	}
}

class CanvasMousemove extends Base {
	enter() {
		const proxy=super.enter();
		const floatHelper=(minMaxFlag,varFlag,inputType,varName,minValue,maxValue)=>{
			const VarName=varName.charAt(0).toUpperCase()+varName.slice(1);
			let dest;
			if (minValue==0 && maxValue==1) {
				dest=(varFlag?"var ":"")+varName+"=";
			} else {
				proxy.pre("var min"+VarName+"="+minValue+";");
				proxy.pre("var max"+VarName+"="+maxValue+";");
				dest=(varFlag?"var ":"")+varName+"=min"+VarName+"+(max"+VarName+"-min"+VarName+")*";
			}
			return proxy.prexy(
				inputType,
				dest+"(ev.clientX-rect.left)/(rect.width-1);",
				dest+"(rect.bottom-1-ev.clientY)/(rect.height-1);"
			);
		};
		proxy.prexy=function(inputType,xLine,yLine){
			if (inputType.axis=='x') {
				return proxy.pre(xLine);
			} else if (inputType.axis=='y') {
				return proxy.pre(yLine);
			}
			return proxy;
		};
		proxy.minMaxFloat=function(inputType,varName,minValue,maxValue){
			return floatHelper(true,false,inputType,varName,minValue,maxValue);
		};
		proxy.minMaxVarFloat=function(inputType,varName,minValue,maxValue){
			return floatHelper(true,true,inputType,varName,minValue,maxValue);
		};
		proxy.newVarInt=function(inputType,varName){
			const VarName=varName.charAt(0).toUpperCase()+varName.slice(1);
			return proxy.prexy(
				inputType,
				"var new"+VarName+"=Math.floor(min"+VarName+"+(max"+VarName+"-min"+VarName+"+1)*(ev.clientX-rect.left)/rect.width);",
				"var new"+VarName+"=Math.floor(min"+VarName+"+(max"+VarName+"-min"+VarName+"+1)*(rect.bottom-1-ev.clientY)/rect.height);"
			);
		};
		return proxy;
	}
	bracketListener() {
		return ["canvas.addEventListener('mousemove',",");"];
	}
	bracketFnArg() {
		return "ev";
	}
	innerPrependedLines() {
		return [
			"var rect=this.getBoundingClientRect();",
		];
	}
}

exports.Slider=Slider;
exports.MultipleSlider=MultipleSlider;
exports.CanvasMousemove=CanvasMousemove;
