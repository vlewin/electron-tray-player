var path = require('path')
var menubar = require('menubar')
var electron = require('electron')
var dialog = electron.dialog

var jsdom = require('jsdom')
var fs = require('fs')
var Server = require('electron-rpc/server')
var app = new Server()

var opts = {
  dir: __dirname,
  icon: path.join(__dirname, 'images', 'Play.png'),
  tooltip: 'MP3/Radio player',
  'preload-window': true,
  'always-on-top': true,
  y: 25,
  width: 500

  // width: 1024
  // height: 600
}

var menu = menubar(opts)

require('electron-connect').client.create(menu.window)

process.on('uncaughtException', function (err) {
  console.error('Exception', err)
  menu.app.terminate()
})

menu.on('ready', function ready() {
  app.on('open', function load(ev, args) {
    openFile()
  })

  app.on('load', function load(ev, args) {
    getRadioStations(0)
  })

  app.on('terminate', function terminate(ev) {
    menu.app.quit()
  })
})

menu.once('show', function () {
  // menu.window.openDevTools({ detach: false })
})

menu.on('show', function show() {
  app.configure(menu.window.webContents)
})

function openFile() {
  var media = []
  var dir = dialog.showOpenDialog({
    properties: ['openDirectory']
  })[0]

  var files = fs.readdirSync(dir)
  for (var i in files) {
    var name = files[i]
    var file = path.join(dir, files[i])

    if (file.endsWith('.mp3')) {
      media.push({ title: name.replace('.mp3', ''), stream: file })
    }
  }

  app.send('show', { stations: media, page: 1 })
}

function getRadioStations(page) {
  console.log('Next page: ', page)
  var page = page || 1
  var url = 'http://muz-puls.ru/category/katalog-radio/page/' + page

  jsdom.env({
    url: url,
    scripts: ['http://code.jquery.com/jquery.js'],
    done: function (err, window) {
      var list = []
      var $ = window.$

      $('div.item').each(function () {
        var $item = $(this)
        var $image = $item.find('img.attachment-thumbnail')
        var $link = $item.find('span.play')

        list.push({
          title: $link.data('title'),
          stream: $link.data('stream'),
          image: $image.attr('src')
        })
      })

      app.send('show', { stations: list, page: page })
    }
  })
}
