var path = require('path')
var glob = require('glob')
var menubar = require('menubar')
var electron = require('electron')
var dialog = electron.dialog
var jsdom = require('jsdom')
var fs = require('fs')
var Server = require('electron-rpc/server')

var LastfmAPI = require('lastfmapi')
var id3 = require('id3js')

var debug = false
var modules = { }
var modules_path = path.join(__dirname, 'modules')

var lfm = new LastfmAPI({
  api_key: '74ade13a78ff603957607591303b91a2',
  secret: 'ca53f40ee0cf594d0fc3cc74dc263f6b'
})

var opts = {
  dir: __dirname,
  icon: path.join(__dirname, 'images', 'Icon.png'),
  tooltip: 'MP3/Radio player',
  'preload-window': true,
  width: debug ? 1000 : 470,
  height: 400,
  resizable: false
}

var menu = menubar(opts)
var app = new Server()

process.on('uncaughtException', function (err) {
  console.error('Exception', err)
  menu.app.quit()
})

menu.on('ready', function ready() {
  app.on('sources', function sources(ev, args) {
    glob.sync(modules_path + '/*.js').forEach(function (file) {
      var name = path.parse(file).base.replace('.js', '')
      modules[name] = require(file)
    })

    app.send('sources', { sources: Object.getOwnPropertyNames(modules) })
  })

  app.on('cover', function cover(ev, args) {
    lfm.track.getInfo(ev.body, function (err, result) {
      if (err) {
        console.log('ERROR: Cover for', ev.body,  err)
      }

      var image = (result && result.album) ? result.album.image[3]['#text'] : null
      app.send('cover', { image: image })
    })
  })

  app.on('open', function open(ev, args) {
    var dir = dialog.showOpenDialog({
      properties: ['openDirectory']
    })[0]

    var playlist = []
    var iterator = 0

    var files = fs.readdirSync(dir)

    files.forEach(function (item) {
      if (item.endsWith('.mp3')) {
        var track = path.join(dir, item)

        console.log(iterator, 'Get tags for', track)

        id3({ file: track, type: id3.OPEN_LOCAL }, function (err, tags) {
          console.log('Title', tags.title, 'artist', tags.artist)

          if (tags.title && tags.artist) {
            // FIXME: Cyrillic encoding
            console.log('Tags found', tags)
            var name = tags.artist + ' - ' + tags.title
            playlist.push({ title: name, track: tags.title, artist: tags.artist, stream: track })
          } else {
            console.log('No tags')
            playlist.push({ title: item, stream: track })
          }

          if (playlist.length == iterator) {
            app.send('show', { playlist: playlist })
          }
        })

        iterator++
      }
    })
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
