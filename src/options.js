'use strict'

const BaseOptions=require('crnx-base/options')

class Options extends BaseOptions {
	get optionClasses() {
		return require('./option-classes')
	}
	get entriesDescription() {
		return [
			['Group','canvas',[
				['CanvasLiveInt','width' ,[1,1024],512,{ unit: 'pixel' }],
				['CanvasLiveInt','height',[1,1024],512,{ unit: 'pixel' }],
			]],
			['Group','background',[
				['Select','type',['none','solid']],
				['LiveColor','color',[1,1,1,1],{
					visibilityData: {'background.type':'solid'},
				}],
			]],
			['Group','material',[
				['Select','scope',['global','vertex','face']], // partly related to shape
				['Select','data',['one','sda']], // partly related to shape
				['LiveColor','color',[1,0,0,1],{
					visibilityData: {'material.scope':'global','material.data':'one'},
				}],
				['LiveColor','specularColor',[0.4,0.4,0.4],{
					visibilityData: {'material.scope':'global','material.data':'sda'},
				}],
				['LiveColor','diffuseColor' ,[0.4,0.4,0.4],{
					visibilityData: {'material.scope':'global','material.data':'sda'}
				}],
				['LiveColor','ambientColor' ,[0.2,0.2,0.2],{
					visibilityData: {'material.scope':'global','material.data':'sda'}
				}],
			]],
			['Group','light',[
				['Select','type',['off','phong','blinn']],
				['Group','direction',[
					['LiveFloat','x',[-4,+4,-4,+4],-1],
					['LiveFloat','y',[-4,+4,-4,+4],+1],
					['LiveFloat','z',[-4,+4,-4,+4],+1],
				],{
					visibilityData: {'light.type':['phong','blinn']}
				}],
			]],
			['Group','shape',[
				['Select','type',['square','triangle','gasket','cube','hat','terrain']],
				['Select','elements',['0','8','16','32']],
				['LiveInt','lod',[0,10],6,{
					visibilityData: {'shape.type':['gasket','hat','terrain']}
				}],
			]],
			['Group','transforms',[
				['Select','projection',['ortho','perspective']],
				['Array','model',[
					['LiveFloat','rotate.x',[-180,+180,-360,+360],0,{ unit: '°' }],
					['LiveFloat','rotate.y',[-180,+180,-360,+360],0,{ unit: '°' }],
					['LiveFloat','rotate.z',[-180,+180,-360,+360],0,{ unit: '°' }],
				]],
			]],
			['Group','debug',[
				['Checkbox','shaders',true],
				['Checkbox','arrays'],
				['Checkbox','inputs'], // TODO hide if no inputs?
				['Checkbox','animations'],
			]],
		]
	}
}

module.exports=Options
