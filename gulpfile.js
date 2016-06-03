'use strict'

var gulp = require('gulp')
var electron = require('electron-connect').server.create()

gulp.task('default', ['serve'])

gulp.task('serve', function () {
  console.log('watching')

  // Start browser process
  electron.start()

  // Reload renderer process
  gulp.watch(['index.js', 'index.html', 'modules/*.js'], electron.restart)

  // Reload renderer process
  gulp.watch(['player.js', 'templates/index.tmpl'], electron.restart)
})
