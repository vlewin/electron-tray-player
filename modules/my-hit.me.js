var jsdom = require('jsdom')

function load() {
  return new Promise(function (resolve, reject) {
    console.log('Loaded module C')

    var page = page || 1
    var url = 'http://muz-puls.ru/category/katalog-radio/page/' + page

    console.log('Loaded module A')
    var url = 'https://my-hit.me'
    var page = page || 1
    var link = 'url' + '/' + page

    jsdom.env({
      url: url,
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (err, window) {
        var list = []
        var $ = window.$

        $('li.item').each(function () {
          var $item = $(this)
          var $link = $item.find('a.dl')
          var $artist = $item.find('span.artist')
          var $title = $item.find('span.track')

          list.push({
            title: $artist.html() + ' - ' + $title.html(),
            artist: $artist.html(),
            stream: $link.attr('href'),
            image: null
          })
        })

        resolve(list)
      }
    })

  })
}

module.exports = {
  load: load
}
