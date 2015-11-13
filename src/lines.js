/*
.a = add AFTER last line
.t = add TO last line

requires array arg for transforms
*/

module.exports=function(indent){
	var Lines=function(){
		this.data=[];
	};
	// TODO translate tabs to indent on .a() and .t()
	Lines.prototype.a=function(){
		for (var i=0;i<arguments.length;i++) {
			this.data.push(arguments[i]);
		}
	};
	Lines.prototype.t=function(){
		var lastLine=this.data.pop();
		this.data.push(lastLine+arguments[0]);
		for (var i=1;i<arguments.length;i++) {
			this.data.push(arguments[i]);
		}
	};
	Lines.prototype.indent=function(){
		this.data=this.data.map(function(line){
			return indent+line;
		});
	};
	return Lines;
};
