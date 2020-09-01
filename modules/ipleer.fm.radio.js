const jsdom = require('jsdom')
const SITE_URL = 'http://ipleer.fm'

function load () {
  return new Promise(function (resolve, reject) {
    jsdom.env({
      url: `${SITE_URL}/radio/russia/`,
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (err, window) {
        if (err) { throw err }

        var list = []
        var $ = window.$

        $('.radio-station').each(() => {
          var $item = $(this)
          var $title = $item.find('h4')
          var $img = $item.find('img')

          list.push({
            title: $title.html(),
            stream: $item.data('mp3'),
            image: `${SITE_URL}${$img.attr('src')}`
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
