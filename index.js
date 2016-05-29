var path = require('path')
var menubar = require('menubar')
var jsdom = require('jsdom')
var Server = require('electron-rpc/server')
var app = new Server()

var opts = {
  dir: __dirname,
  icon: path.join(__dirname, 'images', 'Play.png'),
  tooltip: 'MP3/Radio player',
  'preload-window': true,
  'always-on-top': true,
  y: 25

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
  app.on('load', function load(ev, args) {
    console.log('Load songs and return playlist')
    console.log('ARGS: ', args)
    getRadioStations(0)
  })

  app.on('reload', function terminate(ev) {
    console.log('Call reload')
    console.log(ev)
  })

  app.on('terminate', function terminate(ev) {
    console.log(ev)
    menu.app.quit()
  })
})

menu.once('show', function () {
  // menu.window.openDevTools({ detach: false })
})

menu.on('show', function show() {
  app.configure(menu.window.webContents)
})

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

      // console.log(list)
      app.send('show', { stations: list, page: page })
    }
  })
}
