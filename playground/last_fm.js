
const LastFM = require('../plugins/lastfm')

const p = { artist: 'Руки Вверх', track: 'Unkwnon' }
console.log(LastFM.getCover(p).then((cover) => {
  console.log(cover)
}))

// const LastfmAPI = require('lastfmapi')
// export const lfm = new LastfmAPI({
//   api_key: '74ade13a78ff603957607591303b91a2',
//   secret: 'ca53f40ee0cf594d0fc3cc74dc263f6b'
// })
//
// let params = { artist: 'Руки Вверх', track: 'Unkwnon' }
// // const params = { track: 'believe', artist: 'cher' }
//
// lfm.track.getInfo(params, function (err, result) {
//   let image = null
//
//   if (err) { console.log('ERROR:', params.track, '-', params.artist, err.message) }
//
//   image = (result && result.album) ? result.album.image[3]['#text'] : null
//
//   if (!image) {
//     params = { artist: params.artist }
//     console.log(params)
//
//     lfm.artist.getInfo(params, function (err, result) {
//       if (err) { console.log('ERROR:', err.message) }
//       image = (result && result.image) ? result.image[3]['#text'] : null
//       console.log(image)
//     })
//   }
//   console.log(image)
//   // app.send('cover', { image: image })
// })
