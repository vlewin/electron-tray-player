const LastfmAPI = require('lastfmapi')
let instance = null

class LastFM {
  constructor () {
    if (!instance) {
      instance = this
    }

    this.api = new LastfmAPI({
      api_key: '74ade13a78ff603957607591303b91a2', // eslint-disable-line
      secret: 'ca53f40ee0cf594d0fc3cc74dc263f6b'
    })

    return instance
  }

  getCover (params) {
    console.log('NOTE: getCover for', params)
    return new Promise((resolve, reject) => {
      return this.getTrackCover(params).then((cover) => {
        resolve(cover)
      }).catch(() => {
        return this.getArtistCover(params).then((cover) => {
          resolve(cover)
        }).catch((err) => {
          reject(err)
        })
      })
    })
  }

  getTrackCover (params) {
    return new Promise((resolve, reject) => {
      // FIXME: Not DRY
      this.api.track.getInfo(params, function (err, result) {
        if (err) {
          console.log('ERROR in getTrackCover', err.message)
          return reject(err.message)
        } else {
          console.log('NOTE in getTrackCover', result)
          const image = result.image ? result.image[3]['#text'] : result.album.image[3]['#text']
          return resolve(image)
        }
      })
    })
  }

  getArtistCover (params) {
    return new Promise((resolve, reject) => {
      // FIXME: Not DRY
      this.api.artist.getInfo(params, function (err, result) {
        if (err) {
          console.log('ERROR in getArtistCover', err.message)
          return reject(err.message)
        } else {
          console.log('NOTE in getArtistCover', result)

          const image = (result && result.image) ? result.image[3]['#text'] : null
          return resolve(image)
        }
      })
    })
  }
}

module.exports = new LastFM()
