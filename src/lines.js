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
	// private
	Lines.prototype.flattenArgs=function(s){
		var r=[];
		for (var i=0;i<s.length;i++) {
			if (typeof s[i] == 'string') {
				r.push(s[i]);
			} else {
				Array.prototype.push.apply(r,s[i].data);
			}
		}
		return r;
	};
	Lines.prototype.addFlattenedArgs=function(s){
		Array.prototype.push.apply(this.data,s);
	};
	// public
	Lines.prototype.a=function(){
		this.addFlattenedArgs(
			this.flattenArgs(arguments)
		);
		return this;
	};
	Lines.prototype.t=function(){
		var lastLine=this.data.pop();
		var s=this.flattenArgs(arguments);
		s[0]=lastLine+s[0];
		this.addFlattenedArgs(s);
		return this;
	};
	Lines.prototype.indent=function(){
		this.data=this.data.map(function(line){
			return indent+line;
		});
		return this;
	};
	return Lines;
};
