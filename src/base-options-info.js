// TODO split out live options - or implement them in options-info.js

var BaseOptionsInfo=function(){
	this.entries=this.makeEntries();
};
// abstract fns
// BaseOptionsInfo.prototype.makeEntries=function(){}; // return all options, groups, etc

module.exports=BaseOptionsInfo;
