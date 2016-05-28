var Vue = require('vue')
var Client = require('electron-rpc/client')
var client = new Client()

var Player = Vue.extend({
  props: ['source'],
  template: '<audio id="player" v-bind:src="source" controls autoplay loop> </audio>'
})

var Controls = Vue.extend({
  props: ['playing'],
  computed: {
    label: function () {
      return this.playing ? 'Pause' : 'Play'
    }
  },
  template: `
    <span class="controls">
      <a href="#" class="" v-on:click="$parent.prev"><i class="material-icons icon-medium round">skip_previous</i></a>
      <a href="#" class="" v-on:click="$parent.toggle">
        <i class="material-icons icon-large round" v-if="playing">pause</i>
        <i class="material-icons icon-large round" v-else>play_arrow</i>
      </a>
      <a href="#" class="" v-on:click="$parent.next"><i class="material-icons icon-medium round">skip_next</i></a>
    </span>
  `
})

new Vue({
  el: '#app',

  data: {
    playing: false,
    current: 0,
    progress: 0,
    message: 'Simple player!',
    playlist: [
      'http://tinyurl.com/jfdsl7s',
      'http://tinyurl.com/jj4tysv'
    ]
  },

  computed: {
    progress: function () {
      var player = $('#player')[0]
      var progress = (player.currentTime * 100) / player.duration
      console.log(progress)
      return progress
    }
  },

  ready: function () {
    this.autoplay()

    var _this = this
    var myApp = new Framework7()
    var progressbar = $('.progressbar')

    $('#player').on('timeupdate', function () {
      // console.log('Time update', this.currentTime)
      var progress = (this.currentTime * 100) / this.duration
      myApp.setProgressbar(progressbar, progress)
    })

    $('.open-about').on('click', function () {
      myApp.popup('.popup-about')
    })

    $('.open-services').on('click', function () {
      myApp.popup('.popup-services')
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

      _this.current = _this.playlist[index]

      $('#player').trigger('pause')

      setTimeout(function () {
        $('#player').trigger('play')
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
      this.current = null
      this.playing = false
    },

    prev: function () {
      console.log('Previous')
      this.current = this.playlist[0]
    },

    next: function () {
      console.log('Next')
      this.current = this.playlist[1]
    },

    reload: function () {
      console.log('Reload')
      location.reload()
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
