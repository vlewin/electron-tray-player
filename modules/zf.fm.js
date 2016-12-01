var jsdom = require('jsdom')

function load() {
  return new Promise(function (resolve, reject) {
    var url = 'http://zf.fm/radio'

    jsdom.env({
      url: url,
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (err, window) {
        var list = []
        var $ = window.$

        console.log('zf.fm', 'done')

        $('#radio-carou2 .item').each(function () {
          var $item = $(this)
          var $link = $item.find('a')
          var $img = $link.find('img')

          list.push({
            title: $link.data('title'),
            stream: $link.data('href'),
            image: 'http://zf.fm' + $img.attr('src')
          })
        })

        console.log('zf.fm', list)
        resolve(list)
      }
    })

  })
}

module.exports = {
  load: load
}
