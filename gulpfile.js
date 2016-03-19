'use strict'

const gulp=require('gulp')
const gulpTasks=require('crnx-build/gulp-tasks')

gulpTasks(
	gulp,
	{
		en: "WebGL example generator",
		ru: "Генератор примеров WebGL",
	},
	['http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/styles/default.min.css'],
	['http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/highlight.min.js'],
	[require.resolve('crnx-base')]
)
