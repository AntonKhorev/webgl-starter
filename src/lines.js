/*
.a = add AFTER last line
.t = add TO last line
*/

var Lines=function(){
	this.data=[];
	this.addFlattenedArgs(
		this.flattenArgs(arguments)
	);
};

// private
Lines.prototype.flattenArgs=function(s){
	var r=[];
	for (var i=0;i<s.length;i++) {
		if (typeof s[i] == 'string') {
			r.push(s[i]);
		} else if (Array.isArray(s[i])) {
			Array.prototype.push.apply(r,s[i]);
		} else if (s[i] instanceof Lines) {
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
		return '\t'+line;
	});
	return this;
};
Lines.prototype.isEmpty=function(){
	return this.data.length<=0;
};
Lines.prototype.wrap=function(begin,end){
	this.indent();
	this.data.unshift(begin);
	this.data.push(end);
	return this;
};
Lines.prototype.wrapIfNotEmpty=function(begin,end){
	if (!this.isEmpty()) {
		this.wrap(begin,end);
	}
	return this;
};
/*
Lines.prototype.wrapEachLine=function(begin,end){
	this.data=this.data.map(function(line){
		return begin+line+end;
	});
	return this;
};
*/
Lines.prototype.join=function(){ // TODO formatting options
	return this.data.join('\n');
};

module.exports=Lines;
