var Vue = require('vue')
var Client = require('electron-rpc/client')
var client = new Client()

Vue.filter('time', function (value) {
  if (isNaN(value)) {
    return 'N/A'
  }

  if (!isFinite(value)) {
    return 'Live stream'
  }

  d = Number(value)
  var h = Math.floor(d / 3600)
  var m = Math.floor(d % 3600 / 60)
  var s = Math.floor(d % 3600 % 60)
  return ((h > 0 ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s)
})

var Player = Vue.extend({
  props: ['source'],
  template: '<audio id="player" v-bind:src="source.stream" controls autoplay></audio>'
})

// FIXME: Add loading animation: http://www.alessioatzeni.com/blog/css3-loading-animation-loop/
var Controls = Vue.extend({
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

new Vue({
  el: '#app',

  data: {
    app: new Framework7(),
    playing: false,
    current: { title: 'Paused', stream: '' },
    index: 0,
    progress: 0,
    position: 0,
    duration: 0,
    defaultCover: './images/cover.jpg',
    message: 'Simple player!',
    sources: ['radio', 'files'],
    playlist: [
      { title: 'Stream 1', stream: 'http://tinyurl.com/jfdsl7s' },
      { title: 'Stream 2', stream: 'http://tinyurl.com/jj4tysv' }
    ]
  },

  computed: {
    cover: function () {
      return this.current.image ? this.current.image : this.defaultCover
    }
  },

  ready: function () {
    this.autoplay()

    var _this = this

    client.on('show', function (err, response) {

      _this.app.closeModal('.popup-sources')

      _this.app.addNotification({
        message: response.stations.length + ' items added to playlist!'
      })

      setTimeout(function () {
        _this.app.closeNotification('.notifications')
      }, 2000)

      _this.playlist = response.stations
      _this.autoplay()
    })

    var $progressbar = $('.progressbar')
    $('#player').on('timeupdate', function () {
      _this.position = Math.floor(this.currentTime)
      _this.duration = Math.floor(this.duration)

      var progress = (_this.position * 100) / _this.duration
      _this.app.setProgressbar($progressbar, progress)
    })
  },

  methods: {
    autoplay: function () {
      this.current = this.playlist[0]
      this.playing = true
    },

    toggle: function () {
      this.playing ? this.pause() : this.resume()
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
      this.index = (this.index + 1) < this.playlist.length ? (this.index + 1) : this.index
      this.current = this.playlist[this.index]

      console.log('Next', this.index, this.current.title)
    },

    reload: function () {
      console.log('Reload')
      location.reload()
    },

    favorite: function () {
      console.log('Add/remove to/from favorites')
    },

    open: function () {
      this.playlist = client.request('open')
      // this.app.closeModal('.popup-sources')
    },

    load: function () {
      this.playlist = client.request('load')
      // this.app.closeModal('.popup-sources')
    },

    quite: function () {
      console.log('Quite')
      client.request('terminate')
    }
  },

  components: {
    player: Player,
    controls: Controls
  }
})
