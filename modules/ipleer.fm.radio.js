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

        $('li.radio-station').each((i, item) => {
          var $item = $(item)
          var $img = $item.find('img')
          var station = {
            title: $item.find('h4').text(),
            stream: $item.data('mp3'),
            image: `${SITE_URL}${$img.attr('src')}`
          }
          list.push(station)
        })

        resolve(list)
      }
    })
  })
}

module.exports = {
  load: load
}

load()
