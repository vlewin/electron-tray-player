var jsdom = require('jsdom')

function load() {
  return new Promise(function (resolve, reject) {
    console.log('Loaded module B')

    var page = page || 1
    var url = 'http://muz-puls.ru/category/katalog-radio/page/' + page

    jsdom.env({
      url: url,
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (err, window) {
        console.log('muz-puls.ru', 'done')
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

        console.log('muz-puls', list)

        resolve(list)
      }
    })
  })
}

module.exports = {
  load: load
}
