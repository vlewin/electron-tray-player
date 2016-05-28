var path = require('path')
var menubar = require('menubar')
var jsdom = require('jsdom')
var Server = require('electron-rpc/server')
var app = new Server()

var opts = {
  dir: __dirname,
  icon: path.join(__dirname, 'images', 'Icon.png'),
  'preload-window': true,
  'always-on-top': true,
  y: 25
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
    console.log()
    console.log('ARGS: ', args)
  })

  app.on('reload', function terminate(ev) {
    console.log('Call reload')
    console.log(ev)
  })

  app.on('terminate', function terminate(ev) {
    console.log(ev)
    menu.app.quit()
  })

  app.on('task', function task(req) {
    console.log('Task event', req)
  })
})

menu.once('show', function () {
  menu.window.openDevTools({ detach: false })
})

menu.on('show', function show() {
  app.configure(menu.window.webContents)
})
