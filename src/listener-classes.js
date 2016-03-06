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
				where.push(...arguments)
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
	prependedStatements() {
		return []
	}
	bracketFnArg() {
		return ""
	}
	wrapCall(lines) {
		return lines
	}
	write(haveToUpdateCanvas,haveToLogInput) {
		const statementsGraph={}
		const statementsRoot=[]
		let statementsPrev=null
		const WHITE=0
		const GRAY=1
		const BLACK=2
		const addStatement=(statement,cond)=>{
			let vertex
			if (statement in statementsGraph) {
				vertex=statementsGraph[statement]
			} else {
				vertex=statementsGraph[statement]={
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
			if (statementsPrev!==null) {
				vertex.prevs.push(statementsPrev)
			}
			statementsPrev=statement
		}
		const closeEntryStatements=()=>{
			if (statementsPrev!==null) {
				statementsRoot.push(statementsPrev)
			}
			statementsPrev=null
		}
		const getStatements=()=>{
			const statements=[]
			let currentCond=null
			const writeStatement=(statement,vertex)=>{
				let newCond=null
				if (vertex.conds!==null) {
					newCond=vertex.conds.join(' || ')
				}
				if (newCond!=currentCond) {
					if (currentCond!==null) {
						statements.push("}")
					}
					currentCond=newCond
					if (currentCond!==null) {
						statements.push("if ("+currentCond+") {")
					}
				}
				if (currentCond!==null) {
					statements.push('\t'+statement)
				} else {
					statements.push(statement)
				}
			}
			const recVertex=(statement,vertex)=>{
				vertex.mark=GRAY
				recPrevs(vertex.prevs)
				vertex.mark=BLACK
				writeStatement(statement,vertex)
			}
			const recPrevs=(prevs)=>{
				prevs.forEach((statement)=>{
					if (statementsGraph[statement].mark==WHITE) {
						recVertex(statement,statementsGraph[statement])
					}
				})
			}
			recPrevs(statementsRoot)
			if (currentCond!==null) {
				statements.push("}")
			}
			return statements
		}
		this.entries.forEach((entry)=>{
			entry.pre.forEach(statement=>{
				addStatement(statement,null)
			})
			if (haveToLogInput) {
				entry.log.forEach(statement=>{
					addStatement(statement,entry.cond)
				})
			}
			entry.post.forEach(statement=>{
				addStatement(statement,entry.cond)
			})
			if (haveToUpdateCanvas) {
				addStatement("scheduleFrame();",entry.cond)
			}
			closeEntryStatements()
		})
		const br=this.bracketListener()
		let statements=getStatements()
		if (statements.length>0) {
			statements=[...this.prependedStatements(),...statements]
		}
		if (statements.length==1) {
			const match=/^(\w+)\(\);$/.exec(statements[0])
			if (match) {
				return this.wrapCall(
					JsLines.bae(
						br[0]+match[1]+br[1]
					)
				)
			}
			// TODO what if no match?
		}
		if (statements.length>0) {
			return this.wrapCall(
				WrapLines.b(
					JsLines.bae(br[0]+"function("+this.bracketFnArg()+"){"),
					JsLines.bae("}"+br[1])
				).ae(
					JsLines.bae(...statements)
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
		proxy.prexy=function(inputType,xStatement,yStatement){
			if (inputType.axis=='x') {
				return proxy.pre(xStatement)
			} else if (inputType.axis=='y') {
				return proxy.pre(yStatement)
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
	prependedStatements() {
		return [
			"var rect=this.getBoundingClientRect();",
		]
	}
}

exports.Slider=Slider
exports.MultipleSlider=MultipleSlider
exports.CanvasMousemove=CanvasMousemove
