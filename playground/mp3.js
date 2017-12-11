var fs = require('fs')
var path = require('path')

const id3Parser = require('id3-parser')
const directory = path.join('/Users', 'vlewin', 'Downloads', 'MP3 samples')
var playlist = []

var files = fs.readdirSync(directory).filter(function (file) {
  return file.endsWith('.mp3')
})

files.forEach(function (item, index) {
  if (item.endsWith('.mp3')) {
    var track = path.join(directory, item)
    id3Parser.parse(fs.readFileSync(track)).then(function (tags) {
      console.log(tags)

      if (tags.title && tags.artist) {
        console.log('Tags found', tags)
        var name = tags.artist + ' - ' + tags.title
        const image = (tags.image && tags.image.data) ? tags.image.data.toString('base64') : null
        playlist.push({ title: name, track: tags.title, artist: tags.artist, stream: track, image: image })
      } else {
        console.log('No tags')
        playlist.push({ title: item, stream: track })
      }

      console.log(index, files.length)
      if (files.length === index + 1) {
        console.log('*** DONE')
        console.log(playlist)
        // app.send('show', { playlist: playlist })
      }
    })
  }
})
