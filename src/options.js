'use strict';

var BaseOptions=require('./base/options.js');

class Options extends BaseOptions {
	get optionClasses() {
		return require('./option-classes.js');
	}
	get entriesDescription() {
		return [
			['Group','canvas',[
				['CanvasLiveInt','width',[1,1024],512],
				['CanvasLiveInt','height',[1,1024],512],
			]],
			['Group','background',[
				['Select','type',['none','solid']],
				['LiveColor','color',[1,1,1,1],{'background.type':'solid'}],
			]],
			['Group','material',[
				['Select','scope',['global','vertex','face']], // partly related to shape
				['Select','data',['one','sda']], // partly related to shape
				['LiveColor','color',[1,0,0,1],{'material.scope':'global','material.data':'one'}],
				['LiveColor','specularColor',[0.4,0.4,0.4],{'material.scope':'global','material.data':'sda'}],
				['LiveColor','diffuseColor' ,[0.4,0.4,0.4],{'material.scope':'global','material.data':'sda'}],
				['LiveColor','ambientColor' ,[0.2,0.2,0.2],{'material.scope':'global','material.data':'sda'}],
			]],
			['Group','light',[
				['Select','type',['off','phong','blinn']],
				['Group','direction',[
					['LiveFloat','x',[-4,+4,-4,+4],-1],
					['LiveFloat','y',[-4,+4,-4,+4],+1],
					['LiveFloat','z',[-4,+4,-4,+4],+1],
				],{'light.type':['phong','blinn']}],
			]],
			['Group','shape',[
				['Select','type',['square','triangle','gasket','cube','hat','terrain']],
				['Select','elements',['0','8','16','32']],
				['LiveInt','lod',[0,10],6,{'shape.type':['gasket','hat','terrain']}],
			]],
			// TODO
		];
	}
}
// TODO have json instead of this
/*
OptionsInfo.prototype.makeEntries=function(){
	return new this.OptionRoot([
		new this.OptionGroup('transforms',[
			new this.SelectOption('projection',['ortho','perspective']),
			new this.OptionArray('model',[
				new this.LiveFloatOption('rotateX',[-180,180],0),
				new this.LiveFloatOption('rotateY',[-180,180],0),
				new this.LiveFloatOption('rotateZ',[-180,180],0),
			])
		]),
		new this.OptionGroup('debug',[
			new this.CheckboxOption('shaders',true),
			new this.CheckboxOption('arrays'),
			new this.CheckboxOption('inputs'), // TODO hide if no inputs?
		]),
		new this.OptionGroup('formatting',[
			new this.SelectOption('indent',['tab','2','4','8']),
		])
	]);
};
*/

module.exports=Options;
