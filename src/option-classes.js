'use strict'

const Input=require('./input-classes')
const Option=Object.create(require('crnx-base/option-classes'))

class FixedLiveNumber {
	constructor(src,setToDefault) {
		if (!setToDefault) {
			this.value=src.value
			this.min=src.min
			this.max=src.max
			this.input=Input.createFromString(src.input)
		} else {
			this.value=src.defaultValue
			this.min=src.availableMin
			this.max=src.availableMax
			this.input=Input.createFromString('constant')
		}
		// TODO remove it - needed for formatting and to decide on clamp()/wrap():
		this.availableMin=src.availableMin
		this.availableMax=src.availableMax
		this.precision=src.precision
	}
	valueOf() {
		return this.value
	}
	toString() {
		return String(this.value)
	}
}

// abstract classes

Option.LiveNumber = class extends Option.NumberInput {
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		let dataValue,dataMin,dataMax,dataInput
		if (typeof data == 'object') {
			dataValue=data.value
			dataMin  =data.min
			dataMax  =data.max
			dataInput=data.input
		} else {
			dataValue=data
		}
		super(...arguments)
		this._min=(dataMin!==undefined)?dataMin:this.availableMin
		this._max=(dataMax!==undefined)?dataMax:this.availableMax
		this._input=(dataInput!==undefined)?dataInput:'constant'
		this._$range=null
	}
	updateInternalVisibility() {
		if (this._$range) this._$range.toggle(this._input!='constant')
	}
	get input() {
		return this._input
	}
	set input(input) {
		this._input=input
		this.updateInternalVisibility()
		this.updateCallback()
	}
	get min() {
		return this._min
	}
	set min(min) {
		this._min=min
		this.updateCallback()
	}
	get max() {
		return this._max
	}
	set max(max) {
		this._max=max
		this.updateCallback()
	}
	get $range() {
		return this._$range
	}
	set $range($range) {
		this._$range=$range
		this.updateInternalVisibility()
	}
	exportHelper(src) {
		const data={}
		if (src.value!=src.defaultValue) data.value=src.value
		if (src.min!=src.availableMin) data.min=src.min
		if (src.max!=src.availableMax) data.max=src.max
		if (src.input!='constant') data.input=src.input
		return data
	}
	export() {
		return this.exportHelper(this)
	}
	fix() {
		const fixed=new FixedLiveNumber(this)
		fixed.name=this.name
		return fixed
	}
}

// concrete classes

Option.LiveInt = class extends Option.LiveNumber {
	get precision() {
		return 0
	}
	get availableInputTypes() {
		return ['constant','slider','mousemovex','mousemovey']
	}
}

Option.CanvasLiveInt = class extends Option.LiveInt {
	get availableInputTypes() {
		return ['constant','slider']
	}
}

Option.LiveFloat = class extends Option.LiveNumber {
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		let dataSpeedValue,dataSpeedMin,dataSpeedMax,dataSpeedInput
		if (typeof data == 'object') {
			if (typeof data.speed == 'object') {
				dataSpeedValue=data.speed.value
				dataSpeedMin  =data.speed.min
				dataSpeedMax  =data.speed.max
				dataSpeedInput=data.speed.input
			} else {
				dataSpeedValue=data.speed
			}
		}
		super(...arguments)
		if (objectArg===undefined) objectArg={}
		if (arrayArg===undefined) arrayArg=[]
		if (objectArg.speed!==undefined && objectArg.speed.availableMin!==undefined) {
			this._speedAvailableMin=objectArg.speed.availableMin
		} else if (arrayArg.length>=3) {
			this._speedAvailableMin=arrayArg[2]
		} else {
			throw new Error(`No min speed value provided for LiveFloat option ${fullName}`)
		}
		if (objectArg.speed!==undefined && objectArg.speed.availableMax!==undefined) {
			this._speedAvailableMax=objectArg.speed.availableMax
		} else if (arrayArg.length>=4) {
			this._speedAvailableMax=arrayArg[3]
		} else {
			throw new Error(`No max speed value provided for LiveFloat option ${fullName}`)
		}
		if (objectArg.precision!==undefined) {
			this.precision=objectArg.precision
		} else {
			if (this.availableMax>=100) {
				this.precision=1
			} else if (this.availableMax>=10) {
				this.precision=2
			} else {
				this.precision=3
			}
		}
		this._speedValue=(dataSpeedValue!==undefined)?dataSpeedValue:0
		this._speedMin=(dataSpeedMin!==undefined)?dataSpeedMin:this._speedAvailableMin
		this._speedMax=(dataSpeedMax!==undefined)?dataSpeedMax:this._speedAvailableMax
		this._speedInput=(dataSpeedInput!==undefined)?dataSpeedInput:'constant'
		this._addSpeed=!(
			this._speedValue==0 &&
			this._speedMin==this._speedAvailableMin &&
			this._speedMax==this._speedAvailableMax &&
			this._speedInput=='constant'
		)
		this._speed$=null
		this._$addSpeed=null
	}
	updateInternalVisibility() {
		super.updateInternalVisibility()
		const notGamepad=['gamepad0','gamepad1','gamepad2','gamepad3'].indexOf(this._input)<0
		if (this._speed$) this._speed$.toggle(
			this._addSpeed && notGamepad
		)
		if (this._$addSpeed) this._$addSpeed.toggle(notGamepad)
	}
	get addSpeed() {
		return this._addSpeed
	}
	set addSpeed(addSpeed) {
		this._addSpeed=addSpeed
		this.updateInternalVisibility()
		this.updateCallback()
	}
	get availableInputTypes() {
		return ['constant','slider','mousemovex','mousemovey','gamepad0','gamepad1','gamepad2','gamepad3']
	}
	get speed() {
		const option=this
		return {
			get fullName() {
				return option.fullName+'.speed'
			},
			get defaultValue() {
				return 0
			},
			get value() {
				return option._speedValue
			},
			set value(value) {
				option._speedValue=value
				option.updateCallback()
			},
			get input() {
				return option._speedInput
			},
			set input(input) {
				option._speedInput=input
				option.updateCallback()
			},
			get availableMin() {
				return option._speedAvailableMin
			},
			get availableMax() {
				return option._speedAvailableMax
			},
			get min() {
				return option._speedMin
			},
			set min(min) {
				option._speedMin=min
				option.updateCallback()
			},
			get max() {
				return option._speedMax
			},
			set max(max) {
				option._speedMax=max
				option.updateCallback()
			},
			get precision() {
				return option.precision
			},
			get availableInputTypes() {
				return option.availableInputTypes
			},
			get $() {
				return option._speed$
			},
			set $($) {
				option._speed$=$
				option.updateInternalVisibility()
			}
		}
	}
	get $addSpeed() {
		return this._$addSpeed
	}
	set $addSpeed($addSpeed) {
		this._$addSpeed=$addSpeed
		this.updateInternalVisibility()
	}
	export() {
		const notGamepad=['gamepad0','gamepad1','gamepad2','gamepad3'].indexOf(this.input)<0
		const data=this.exportHelper(this)
		if (notGamepad && this.addSpeed) {
			this.shortenExportAssign(this.exportHelper(this.speed),data,'speed')
		}
		return data
	}
	fix() {
		const fixed=super.fix()
		const notGamepad=['gamepad0','gamepad1','gamepad2','gamepad3'].indexOf(this.input)<0
		if (notGamepad && this.addSpeed) {
			fixed.speed=new FixedLiveNumber(this.speed)
		} else {
			fixed.speed=new FixedLiveNumber(this.speed,true)
		}
		return fixed
	}
}

Option.LiveColor = class extends Option.Group {
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		if (objectArg===undefined) objectArg={}
		if (arrayArg===undefined) arrayArg=[]
		objectArg=Object.create(objectArg)
		let componentDefaultValues=arrayArg
		if (objectArg.componentDefaultValues) {
			componentDefaultValues=objectArg.componentDefaultValues
		}
		const cs='rgba'
		objectArg.descriptions=componentDefaultValues.map((defaultValue,i)=>{
			const c=cs.charAt(i)
			return ['LiveFloat',c,[0,1,-1,+1],defaultValue]
		})
		arrayArg=undefined
		super(
			name,arrayArg,scalarArg,objectArg,data,
			fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
		)
	}
}

module.exports=Option
