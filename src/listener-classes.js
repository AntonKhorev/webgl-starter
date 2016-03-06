'use strict'

const capitalize=require('crnx-base/fake-lodash/capitalize')
const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')

class Base {
	constructor() {
		this.entries=[]
	}
	enter() {
		const entry={
			pre: [],
			cond: null,
			log: [],
			post: [],
		}
		this.entries.push(entry)
		function makePushArgs(where){
			return function(){
				for (let i=0;i<arguments.length;i++) {
					where.push(arguments[i])
				}
				return proxy
			}
		}
		const proxy={
			pre: makePushArgs(entry.pre),
			cond: function(cond){
				entry.cond=cond
				return proxy
			},
			log: makePushArgs(entry.log),
			post: makePushArgs(entry.post),
		}
		return proxy
	}
	innerPrependedLines() {
		return []
	}
	bracketFnArg() {
		return ""
	}
	wrapCall(lines) {
		return lines
	}
	write(haveToUpdateCanvas,haveToLogInput) {
		const innerLinesGraph={}
		const innerLinesRoot=[]
		let innerLinesPrev=null
		const WHITE=0
		const GRAY=1
		const BLACK=2
		const addInnerLine=(line,cond)=>{
			let vertex
			if (line in innerLinesGraph) {
				vertex=innerLinesGraph[line]
			} else {
				vertex=innerLinesGraph[line]={
					prevs: [],
					conds: [],
					mark: WHITE,
				}
			}
			if (vertex.conds!==null) {
				if (cond===null) {
					vertex.conds=null
				} else {
					vertex.conds.push(cond)
				}
			}
			if (innerLinesPrev!==null) {
				vertex.prevs.push(innerLinesPrev)
			}
			innerLinesPrev=line
		}
		const closeEntryInnerLines=()=>{
			if (innerLinesPrev!==null) {
				innerLinesRoot.push(innerLinesPrev)
			}
			innerLinesPrev=null
		}
		const writeInnerLines=()=>{
			const lines=[]
			let currentCond=null
			const writeLine=(line,vertex)=>{
				let newCond=null
				if (vertex.conds!==null) {
					newCond=vertex.conds.join(' || ')
				}
				if (newCond!=currentCond) {
					if (currentCond!==null) {
						lines.push("}")
					}
					currentCond=newCond
					if (currentCond!==null) {
						lines.push("if ("+currentCond+") {")
					}
				}
				if (currentCond!==null) {
					lines.push('\t'+line)
				} else {
					lines.push(line)
				}
			}
			const recVertex=(line,vertex)=>{
				vertex.mark=GRAY
				recPrevs(vertex.prevs)
				vertex.mark=BLACK
				writeLine(line,vertex)
			}
			const recPrevs=(prevs)=>{
				prevs.forEach((line)=>{
					if (innerLinesGraph[line].mark==WHITE) {
						recVertex(line,innerLinesGraph[line])
					}
				})
			}
			recPrevs(innerLinesRoot)
			if (currentCond!==null) {
				lines.push("}")
			}
			return lines
		}
		this.entries.forEach((entry)=>{
			entry.pre.forEach(line=>{
				addInnerLine(line,null)
			})
			if (haveToLogInput) {
				entry.log.forEach(line=>{
					addInnerLine(line,entry.cond)
				})
			}
			entry.post.forEach(line=>{
				addInnerLine(line,entry.cond)
			})
			if (haveToUpdateCanvas) {
				addInnerLine("scheduleFrame();",entry.cond)
			}
			closeEntryInnerLines()
		})
		const br=this.bracketListener()
		let innerLines=writeInnerLines() // TODO rename innerLines here and above to innerLineArray b/c it's not Lines class
		if (innerLines.length>0) {
			innerLines=[...this.innerPrependedLines(),...innerLines]
		}
		if (innerLines.length==1) {
			const match=/^(\w+)\(\);$/.exec(innerLines[0])
			if (match) {
				return this.wrapCall(
					JsLines.bae(
						br[0]+match[1]+br[1]
					)
				)
			}
			// TODO what if no match?
		}
		if (innerLines.length>0) {
			return this.wrapCall(
				WrapLines.b(
					JsLines.bae(br[0]+"function("+this.bracketFnArg()+"){"),
					JsLines.bae("}"+br[1])
				).ae(
					JsLines.bae(...innerLines)
				)
			)
		} else {
			return JsLines.be()
		}
	}
}

class Slider extends Base {
	constructor(id) {
		super()
		this.id=id
	}
	bracketListener() {
		return ["document.getElementById('"+this.id+"').addEventListener('change',",");"]
	}
}

class MultipleSlider extends Base {
	constructor(query) {
		super()
		this.query=query
	}
	bracketListener() {
		return ["el.addEventListener('change',",");"]
	}
	wrapCall(lines) {
		return WrapLines.b(
			JsLines.bae(";[].forEach.call(document.querySelectorAll('"+this.query+"'),function(el){"),
			JsLines.bae("});")
		).ae(lines)
	}
}

class CanvasMousemove extends Base {
	enter() {
		const proxy=super.enter()
		const floatHelper=(minMaxFlag,varFlag,inputType,varName,minValue,maxValue)=>{
			const VarName=capitalize(varName)
			let dest
			if (minValue==0 && maxValue==1) {
				dest=(varFlag?"var ":"")+varName+"="
			} else {
				proxy.pre("var min"+VarName+"="+minValue+";")
				proxy.pre("var max"+VarName+"="+maxValue+";")
				dest=(varFlag?"var ":"")+varName+"=min"+VarName+"+(max"+VarName+"-min"+VarName+")*"
			}
			return proxy.prexy(
				inputType,
				dest+"(ev.clientX-rect.left)/(rect.width-1);",
				dest+"(rect.bottom-1-ev.clientY)/(rect.height-1);"
			)
		}
		proxy.prexy=function(inputType,xLine,yLine){
			if (inputType.axis=='x') {
				return proxy.pre(xLine)
			} else if (inputType.axis=='y') {
				return proxy.pre(yLine)
			}
			return proxy
		}
		proxy.minMaxFloat=function(inputType,varName,minValue,maxValue){
			return floatHelper(true,false,inputType,varName,minValue,maxValue)
		}
		proxy.minMaxVarFloat=function(inputType,varName,minValue,maxValue){
			return floatHelper(true,true,inputType,varName,minValue,maxValue)
		}
		proxy.newVarInt=function(inputType,varName){
			const VarName=capitalize(varName)
			return proxy.prexy(
				inputType,
				"var new"+VarName+"=Math.floor(min"+VarName+"+(max"+VarName+"-min"+VarName+"+1)*(ev.clientX-rect.left)/rect.width);",
				"var new"+VarName+"=Math.floor(min"+VarName+"+(max"+VarName+"-min"+VarName+"+1)*(rect.bottom-1-ev.clientY)/rect.height);"
			)
		}
		return proxy
	}
	bracketListener() {
		return ["canvas.addEventListener('mousemove',",");"]
	}
	bracketFnArg() {
		return "ev"
	}
	innerPrependedLines() {
		return [
			"var rect=this.getBoundingClientRect();",
		]
	}
}

exports.Slider=Slider
exports.MultipleSlider=MultipleSlider
exports.CanvasMousemove=CanvasMousemove
