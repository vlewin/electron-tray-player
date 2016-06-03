var request = require('request')

function load() {
  return new Promise(function (resolve, reject) {
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
      if (error) {
        reject(error)
      }

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

        resolve(list)
      }
    }

    request(options, callback)
  })
}

module.exports = {
  load: load
}
