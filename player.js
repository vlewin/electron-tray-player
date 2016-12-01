var Vue = require('vue/dist/vue.js')
var Client = require('electron-rpc/client')
var client = new Client()

Vue.filter('time', function (value) {
  if (isNaN(value)) {
    return 'N/A'
  }

  if (!isFinite(value)) {
    return 'Live stream'
  }

  var d = Number(value)
  var h = Math.floor(d / 3600)
  var m = Math.floor(d % 3600 / 60)
  var s = Math.floor(d % 3600 % 60)
  return ((h > 0 ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s)
})

var Player = Vue.component('player', {
  props: ['source'],
  template: '<audio id="player" v-bind:src="source.stream" controls autoplay></audio>'
})

// FIXME: Add loading animation: http://www.alessioatzeni.com/blog/css3-loading-animation-loop/
var Controls = Vue.component('controls', {
  props: ['playing'],
  computed: {
    stream: function () {
      var stream = this.source ? this.source.stream : ''
      console.log('Stream is: ', stream)
      return stream
    },

    label: function () {
      return this.playing ? 'Pause' : 'Play'
    }
  },

  /* eslint-disable rule-name */
  template: `
    <span class="controls">
      <a href="#" class="" v-on:click="$parent.prev"><i class="material-icons icon-medium round">skip_previous</i></a>
      <a href="#" class="" v-on:click="$parent.toggle">
        <i class="material-icons icon-large round playing" v-if="playing">pause</i>
        <i class="material-icons icon-large round" v-else>play_arrow</i>
      </a>
      <a href="#" class="" v-on:click="$parent.next"><i class="material-icons icon-medium round">skip_next</i></a>
    </span>
  `
})

/* eslint no-underscore-dangle: ["error", { "allow": ["_this"] }]*/
var vm = new Vue({
  el: '#app',

  data: {
    app: new Framework7(),
    current: { title: 'Paused', stream: '' },
    defaultCover: './images/cover.jpg',
    lastFmCover: false,
    playing: false,
    index: 0,
    progress: 0,
    position: 0,
    duration: 0,
    muted: false,
    volume: 0.5,
    sources: [],
    playlist: [

      // { title: 'Stream 1', stream: 'http://tinyurl.com/jfdsl7s' },
      // { title: 'Stream 2', stream: 'http://tinyurl.com/jj4tysv' }
      { title: 'UFO Takeoff', stream: 'http://soundbible.com/mp3/UFO_Takeoff-Sonidor-1604321570.mp3' },
      { title: 'UFO Landing', stream: 'http://soundbible.com/mp3/descending_craft-Sonidor-991848481.mp3' }

    ]
  },

  computed: {
    cover: function () {
      return this.current.image ? this.current.image : this.defaultCover
    }
  },

  mounted: function () {
    let _this = this

    this.autoplay()
    this.setVolume(this.volume)

    $('body').keydown(function (e) {
      if (e.keyCode === 32) {
        _this.toggle()
      }
    })

    // FIXME: Move to function
    client.request('sources')

    client.on('sources', function (err, response) {
      console.log('On source')
      _this.sources = response.sources
    })

    client.on('show', function (err, response) {
      _this.app.closeModal('.popup-sources')

      _this.app.addNotification({
        message: response.playlist.length + ' items added to playlist!'
      })

      setTimeout(function () {
        _this.app.closeNotification('.notifications')
      }, 2000)

      _this.playlist = response.playlist
      _this.autoplay()
    })

    client.on('cover', function (err, response) {
      console.warn('*** Got cover image', response.image)
      if (!!response.image) {
        _this.lastFmCover = !!response.image
        vm.$set('current.image', response.image)
      } else {
        vm.$set('current.skipImage', true)
      }
    })

    $('#player').on('play', function () {
      console.log('*** PLayback started', _this.current.title)
      if (_this.current.skipImage && _this.current.artist) {
        console.log('Request image from LastfmAPI for', _this.current.artist, _this.current.track)
        setTimeout(function () {
          var params = { artist: _this.current.artist, track: _this.current.track }
          client.request('cover', params)
        }, 2000)
      }
    })

    var $progressbar = $('.progressbar')
    $('#player').on('timeupdate', function () {
      _this.position = Math.floor(this.currentTime)
      _this.duration = Math.floor(this.duration)

      var progress = (_this.position * 100) / _this.duration
      _this.app.setProgressbar($progressbar, progress)
    })

    $('#player').on('ended', function () {
      _this.next()
    })
  },

  watch: {
    volume: function (val) {
      this.setVolume(val)
    }
  },

  methods: {
    autoplay: function () {
      this.index = 0
      this.current = this.playlist[this.index]
      this.playing = true
    },

    toggle: function () {
      if (this.playing) {
        this.pause()
      } else {
        this.resume()
      }
    },

    play: function (index) {
      var _this = this
      console.log('Play', index)

      var $player = $('#player')
      _this.current = _this.playlist[index]

      $player.trigger('pause')

      setTimeout(function () {
        $player.trigger('play')
        _this.playing = true
      }, 200)
    },

    mute() {
      this.muted = true
      this.volume = 0
    },

    umute() {
      this.muted = false
      this.volume = 0.5
    },

    setVolume(value) {
      this.muted = !value
      $('#player')[0].volume = value
    },

    resume: function () {
      console.log('Resume')
      $('#player').trigger('play')
      this.playing = true
    },

    pause: function () {
      console.log('Pause')
      $('#player').trigger('pause')
      this.playing = false
    },

    prev: function () {
      this.index = (this.index - 1) < 0 ? 0 : (this.index - 1)
      this.current = this.playlist[this.index]
      console.log('Previous', this.index, this.current.title)
    },

    next: function () {
      console.log(this.index)
      console.log(this.playlist.length)
      this.index = (this.index + 1) < this.playlist.length ? (this.index + 1) : this.index
      this.current = this.playlist[this.index]

      console.log('Next', this.index, this.current.title)
    },

    title: function (song) {
      console.log('Decorate title', song.title, song.artist)
      var name = song.artist ? (song.artist + ' - ' + song.title) : song.title
      console.log(name)
      return name
    },

    reload: function () {
      console.log('Reload')
      location.reload()
    },

    favorite: function () {
      console.log('Add/remove to/from favorites')
    },

    open: function () {
      client.request('open')
    },

    load: function (playlist) {
      client.request('load', playlist)
    },

    quite: function () {
      client.request('terminate')
    }
  },

  components: {
    player: Player,
    controls: Controls
  }
})
