var jsdom = require('jsdom')

function load () {
  return new Promise(function (resolve, reject) {
    var url = 'http://iplayer.fm/radio/russia/'
    var page = page || 1

    jsdom.env({
      url: url,
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (err, window) {
        if (err) { throw err }

        var list = []
        var $ = window.$

        console.log('my-hit.me', 'done')

        $('.radio-station').each(function () {
          var $item = $(this)
          var $title = $item.find('h4')
          var $img = $item.find('img')

          list.push({
            title: $title.html(),
            stream: $item.data('mp3'),
            image: 'http://iplayer.fm' + $img.attr('src')
          })
        })

        // console.log('iplayer.fm/radio', list)
        resolve(list)
      }
    })
  })
}

module.exports = {
  load: load
}
