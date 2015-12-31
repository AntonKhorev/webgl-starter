'use strict';

var BaseOptions=require('./base/options.js');

class Options extends BaseOptions {
	get optionClasses() {
		return require('./option-classes.js');
	}
	get entriesDescription() {
		return [
			['Group','canvas',[
				['LiveInt','width',[1,1024],512], // TODO remove mouse from inputs by subclassing LiveIntInputOption -> LiveCanvasIntInputOption
				['LiveInt','height',[1,1024],512],
			]],
			['Group','background',[
				['Select','type',['none','solid']],
				['LiveColor','color',[1,1,1,1],{'background.type':'solid'}],
			]],
			['Group','material',[
				['Select','scope',['global','vertex','face']], // partly related to shape
				['Select','data',['one','sda']], // partly related to shape
				['LiveColor','color',[1,0,0,1],{'material.scope':'global','material.data':'one'}],
				// TODO
			]],
			// TODO
		];
	}
}
// TODO have json instead of this
/*
OptionsInfo.prototype.makeEntries=function(){
	return new this.OptionRoot([
		new this.OptionGroup('material',[
			new this.OptionGroup('color',[
				new this.LiveFloatOption('r',[0,1],1),
				new this.LiveFloatOption('g',[0,1],0),
				new this.LiveFloatOption('b',[0,1],0),
				new this.LiveFloatOption('a',[0,1],1),
			],{'material.scope':'global','material.data':'one'}),
			new this.OptionGroup('specularColor',[
				new this.LiveFloatOption('r',[0,1],0.4),
				new this.LiveFloatOption('g',[0,1],0.4),
				new this.LiveFloatOption('b',[0,1],0.4),
			],{'material.scope':'global','material.data':'sda'}),
			new this.OptionGroup('diffuseColor',[
				new this.LiveFloatOption('r',[0,1],0.4),
				new this.LiveFloatOption('g',[0,1],0.4),
				new this.LiveFloatOption('b',[0,1],0.4),
			],{'material.scope':'global','material.data':'sda'}),
			new this.OptionGroup('ambientColor',[
				new this.LiveFloatOption('r',[0,1],0.2),
				new this.LiveFloatOption('g',[0,1],0.2),
				new this.LiveFloatOption('b',[0,1],0.2),
			],{'material.scope':'global','material.data':'sda'})
		]),
		new this.OptionGroup('light',[
			new this.SelectOption('type',['off','phong','blinn']),
			new this.OptionGroup('direction',[
				new this.LiveFloatOption('x',[-4,+4],-1),
				new this.LiveFloatOption('y',[-4,+4],+1),
				new this.LiveFloatOption('z',[-4,+4],+1),
			],{'light.type':['phong','blinn']})
		]),
		new this.OptionGroup('shape',[
			new this.SelectOption('type',['square','triangle','gasket','cube','hat','terrain']),
			new this.SelectOption('elements',['0','8','16','32']),
			new this.LiveIntNumberOption('lod',[0,10],6,{'shape.type':['gasket','hat','terrain']}),
		]),
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
