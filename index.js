var path = require('path')
var glob = require('glob')
var menubar = require('menubar')
var electron = require('electron')
var dialog = electron.dialog
var jsdom = require('jsdom')
var fs = require('fs')
var Server = require('electron-rpc/server')

var debug = false
var modules = { }

var opts = {
  dir: __dirname,
  icon: path.join(__dirname, 'images', 'Icon.png'),
  tooltip: 'MP3/Radio player',
  'preload-window': true,
  width: debug ? 1000 : 500,
  height: 400
}

var menu = menubar(opts)
var app = new Server()

process.on('uncaughtException', function (err) {
  console.error('Exception', err)
  menu.app.quit()
})

menu.on('ready', function ready() {
  app.on('sources', function sources(ev, args) {
    glob.sync('./modules/*.js').forEach(function (file) {
      var name = path.parse(file).base.replace('.js', '')
      modules[name] = require(file)
    })

    app.send('sources', { sources: Object.getOwnPropertyNames(modules) })
  })

  app.on('open', function open(ev, args) {
    var playlist = []
    var dir = dialog.showOpenDialog({
      properties: ['openDirectory']
    })[0]

    var files = fs.readdirSync(dir)
    for (var i in files) {
      var name = files[i]
      var file = path.join(dir, files[i])

      if (file.endsWith('.mp3')) {
        playlist.push({ title: name.replace('.mp3', ''), stream: file })
      }
    }

    app.send('show', { playlist: playlist })
  })

  app.on('load', function load(ev, args) {
    var key = ev.body
    var playlist = modules[key].load().then(function (playlist) {
      app.send('show', { playlist: playlist })
    })
  })

  app.on('terminate', function terminate(ev) {
    menu.app.quit()
  })
})

menu.once('show', function () {
  if (debug) {
    menu.window.openDevTools({ detach: false })
  }
})

menu.on('show', function show() {
  app.configure(menu.window.webContents)
})

menu.on('after-create-window', function () {
  app.configure(menu.window.webContents)
})
