(function () {
  function initializePlayer(shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-play]');
    var hlsInstance = null;

    if (!video || !trigger) {
      return;
    }

    function startPlayback() {
      var streamUrl = trigger.getAttribute('data-play');
      if (!streamUrl) {
        return;
      }

      if (!video.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        video.dataset.ready = '1';
        video.setAttribute('controls', 'controls');
      }

      shell.classList.add('is-playing');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    trigger.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
      if (!video.dataset.ready || video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(initializePlayer);
})();
