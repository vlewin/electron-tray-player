const path = require('path')
const glob = require('glob')
const menubar = require('menubar')
const electron = require('electron')
const dialog = electron.dialog
const fs = require('fs')
const Server = require('electron-rpc/server')

const LastfmAPI = require('lastfmapi')
const id3Parser = require('id3-parser')
const modules = { }

const DEBUG = process.env.DEBUG
const MODULES_PATH = path.join(__dirname, 'modules')

const lfm = new LastfmAPI({
  api_key: '74ade13a78ff603957607591303b91a2',
  secret: 'ca53f40ee0cf594d0fc3cc74dc263f6b'
})

var opts = {
  dir: __dirname,
  icon: path.join(__dirname, 'images', 'Icon.png'),
  tooltip: 'MP3/Radio tray player',
  width: DEBUG ? 1000 : 400,
  height: 400,
  preloadWindow: true,
  resizable: false
}

var menu = menubar(opts)
var app = new Server()

process.on('uncaughtException', function (err) {
  console.error('Exception', err)
  menu.app.quit()
})

menu.on('ready', function ready () {
  app.on('sources', function sources () {
    glob.sync(MODULES_PATH + '/*.js').forEach(function (file) {
      var name = path.parse(file).base.replace('.js', '')
      console.log('*** Found module:', name, 'in file:', file)
      modules[name] = require(file) // eslint-disable-line global-require
    })

    app.send('sources', { sources: Object.getOwnPropertyNames(modules) })
  })

  app.on('cover', function cover (ev) {
    let params = ev.body
    lfm.track.getInfo(params, function (err, result) {
      if (err) { console.log('ERROR:', err.message) }
      let image = (result && result.album) ? result.album.image[3]['#text'] : null

      if (image) {
        app.send('cover', { image: image })
      } else {
        params = { artist: params.artist }
        console.log('Get artist info', params)

        lfm.artist.getInfo(params, function (err, result) {
          console.log(result)
          if (err) { console.log('ERROR:', err.message) }
          image = (result && result.image) ? result.image[3]['#text'] : null
          app.send('cover', { image: image })
        })
      }
    })

    // lfm.track.getInfo(ev.body, function (err, result) {
    //   if (err) {
    //     console.log('ERROR: Cover for', ev.body, err)
    //   }
    //
    //   var image = (result && result.album) ? result.album.image[3]['#text'] : null
    //   app.send('cover', { image: image })
    // })
  })

  app.on('open', function open () {
    var dir = dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (!dir) return

    var directory = dir[0]
    var playlist = []

    var files = fs.readdirSync(directory).filter(function (file) {
      return file.endsWith('.mp3')
    })

    files.forEach(function (item, index) {
      var track = path.join(directory, item)
      id3Parser.parse(fs.readFileSync(track)).then(function (tags) {
        console.log(tags)
        const song = {}
        song.stream = track

        if (tags.title && tags.artist) {
          song.title = tags.title
          song.artist = tags.artist
          song.name = tags.artist + ' - ' + tags.title
          song.image = (tags.image && tags.image.data) ? `data:image/png;base64,${tags.image.data.toString('base64')}` : null
        } else {
          console.warn('No tags')
          song.title = item
        }

        playlist.push(song)

        if (files.length === index + 1) {
          app.send('show', { playlist: playlist })
        }
      })
    })
  })

  app.on('load', function load (ev) {
    var key = ev.body
    console.log(modules)
    const module = modules[key]
    if (module) {
      modules[key].load().then(function (playlist) {
        app.send('show', { playlist: playlist })
      })
    } else {
      console.warn('WARN:', 'Playlist/module:', key, 'not found!')
    }
  })

  app.on('terminate', function terminate () {
    menu.app.quit()
  })
})

menu.once('show', function () {
  if (DEBUG) {
    menu.window.openDevTools({ detach: false })
  }
})

menu.on('show', function show () {
  app.configure(menu.window.webContents)
})

menu.on('after-create-window', function () {
  app.configure(menu.window.webContents)
})
