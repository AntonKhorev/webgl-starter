'use strict'

class Base {
	constructor(str) {
		this._str=str
	}
	toString() {
		return this._str
	}
	valueOf() {
		return this._str
	}
}

class Constant extends Base {
}

class Variable extends Base {
}

class Slider extends Variable {
}

class MouseMove extends Variable {
	constructor(str) {
		super(str)
		this.axis=str.slice(-1)
	}
}

class Gamepad extends Variable {
	constructor(str) {
		super(str)
		this.axis=Number(str.slice(-1))
	}
}

function createFromString(str) {
	return new {
		'constant':   Constant,
		'slider':     Slider,
		'mousemovex': MouseMove,
		'mousemovey': MouseMove,
		'gamepad0':   Gamepad,
		'gamepad1':   Gamepad,
		'gamepad2':   Gamepad,
		'gamepad3':   Gamepad,
	}[str](str)
}

exports.Base=Base
exports.Constant=Constant
exports.Variable=Variable
exports.Slider=Slider
exports.MouseMove=MouseMove
exports.Gamepad=Gamepad
exports.createFromString=createFromString
