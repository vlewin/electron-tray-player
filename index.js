var path = require('path')
var glob = require('glob')
var menubar = require('menubar')
var electron = require('electron')
var dialog = electron.dialog
var window = electron.window

var jsdom = require('jsdom')
var fs = require('fs')
var Server = require('electron-rpc/server')

var debug = true
var MODULES_DIR = path.join(path.dirname(__filename), 'modules')
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
  app.destroy()
  menu.app.quit()
})

menu.on('ready', function ready() {
  app.on('sources', function sources(ev, args) {
    glob.sync(MODULES_DIR + '/*.js').forEach(function (file) {
      var name = path.parse(file).base.replace('.js', '')
      modules[name] = require(file)
    })

    console.log('Loaded modules:', modules)
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

function radioDePlaylist() {
  var endpoint = 'https://api.radio.de/info/v2/search/recommended'
  var params = '?apikey=0e8313a82b584e1acbb2e5b1f4e6605800d4b438&pageindex=1&sizeperpage=20&streamcontentformats=MP3'

  var options = {
    url: endpoint + params,
    followAllRedirects: true,
    json: true,
    headers: {
      Host: 'api.radio.de',
      Cookie: 'radiode-stay-loggedin=OGENi7xkDLnckQyICQjoHxuVE49CAEOrQ2NzvBdeT24_c-Im4UEQjFWIzZZQaSP1#48A5489F85AA3B22C11F83D5EC306D2D;',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36',
      'Accept-Language': 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4,ru;q=0.2'
    }
  }

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var list = []
      for (i in body.pageItems) {
        var statiton = body.pageItems[i]
        list.push({
          title: statiton.name,
          stream: statiton.streamUrls[0].streamUrl,
          image: statiton.logo300x300
        })
      }

      app.send('show', { stations: list })
    }
  }

  request(options, callback)
}

// function radioRuPlaylist() {
//   var page = page || 1
//   var url = 'http://muz-puls.ru/category/katalog-radio/page/' + page
//
//   jsdom.env({
//     url: url,
//     scripts: ['http://code.jquery.com/jquery.js'],
//     done: function (err, window) {
//       var list = []
//       var $ = window.$
//
//       $('div.item').each(function () {
//         var $item = $(this)
//         var $image = $item.find('img.attachment-thumbnail')
//         var $link = $item.find('span.play')
//
//         list.push({
//           title: $link.data('title'),
//           stream: $link.data('stream'),
//           image: $image.attr('src')
//         })
//       })
//
//       app.send('show', { stations: list, page: page })
//     }
//   })
// }
