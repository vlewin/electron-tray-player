// const Client = require('castv2-client').Client
// const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver
var mdns = require('mdns')

// browser.on('serviceUp', function (service) {
//   console.log(service)
//   console.log('found device "%s" at %s:%d', service.txtRecord.fn, service.addresses[0], service.port)
//   if (service.txtRecord.md === 'MIBOX3') {
//     // ondeviceup(service.addresses[0])
//     // browser.stop();
//   }
//
//   setTimeout(function () {
//     browser.stop()
//   }, 10000)
// })
//
// browser.start()

class ChromecastPlayer {
  constructor (host) {
    this.host = host
  }

  play (url) {
    const Client = require('castv2-client').Client
    const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver

    var client = new Client()

    client.connect(this.host, function () {
      console.log('connected, launching app ...')

      client.launch(DefaultMediaReceiver, function (err, player) {
        console.log(err)
        var media = {
          contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
          contentType: 'video/mp4',
          streamType: 'BUFFERED', // or LIVE

          metadata: {
            type: 0,
            metadataType: 0,
            title: 'Big Buck Bunny',
            images: [
              { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
            ]
          }
        }

        player.on('status', function (status) {
          console.log('status broadcast playerState=%s', status.playerState)
        })

        console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId)

        player.load(media, { autoplay: true }, function (err, status) {
          console.log(err)
          console.log('media loaded playerState=%s', status.playerState)
        })
      })
    })

    client.on('error', function (err) {
      console.log('Error: %s', err.message)
      client.close()
    })
  }
}

class Chromecast {
  constructor () {
    this.browser = mdns.createBrowser(mdns.tcp('googlecast'))
  }

  init () {
    this.browser.on('serviceUp', (service) => {
      console.log(service)
      console.log('found device "%s" at %s:%d', service.txtRecord.fn, service.addresses[0], service.port)
      if (service.txtRecord.md === 'MIBOX3') {
        // ondeviceup(service.addresses[0])
        // browser.stop();
      }

      setTimeout(function () {
        this.browser.stop()
      }.bind(this), 2000)
    })

    this.browser.start()

    // console.log(this.browser)
    // this.startScan()
    //
    // this.browser.on('serviceUp', function (service) {
    //   console.log(service)
    //   console.log('found device "%s" at %s:%d', service.txtRecord.fn, service.addresses[0], service.port)
    //
    //   setTimeout(function () {
    //     console.log('stop scan')
    //     this.browser.stop()
    //   }, 50000)
    // })
  }

  startScan () {
    console.log('DEVICE: Start scanning for devices')
    this.browser.start()
  }

  stopScan () {
    console.log('DEVICE: Stop scanning for devices')
    return this.browser.stop()
  }

  play (host, stream) {
    console.log(host)
    const Client = require('castv2-client').Client
    const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver
    var client = new Client()

    client.connect(host, function () {
      console.log('connected, launching app ...')

      client.launch(DefaultMediaReceiver, function (err, player) {
        console.log(err)
        var media = {
          contentId: stream.stream,
          // contentType: 'video/mp4',
          streamType: 'LIVE', // BUFFERED or LIVE

            // Title and cover displayed while buffering
          metadata: {
            type: 0,
            metadataType: 0,
            title: stream.title,
            images: [
                { url: stream.image }
            ]
          }
        }

        // player.on('status', function (status) {
        //   console.log('status broadcast playerState=%s', status.playerState)
        // })

        console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId)

        player.load(media, { autoplay: true }, (err, status) => {
          console.log(err)
          console.log('media loaded playerState=%s', status.playerState)

            // Seek to 2 minutes after 15 seconds playing.
          setTimeout(function () {
            player.seek(2 * 60, (err, status) => {
              console.log(err)

                //
            })
          }, 15000)
        })
      })
    })

    client.on('error', function (err) {
      console.log('Error: %s', err.message)
      client.close()
    })
  }
}

// Chromecast.init()
module.exports = Chromecast
