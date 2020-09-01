'use strict'

var gulp = require('gulp')
var electron = require('electron-connect').server.create()

gulp.task('serve', () => {
  electron.start()
  gulp.watch(['index.js', 'player.js', 'index.html', 'assets/css/*.css', 'modules/*.js']).on('change', (event) => {
    electron.restart
  })
})
