(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function attachStream(video, stream) {
    if (!stream) {
      return null;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.load();
      return null;
    }
    var Hls = window.Hls;
    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return hls;
    }
    video.src = stream;
    video.load();
    return null;
  }

  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-start");
    var stream = shell.getAttribute("data-stream");
    var attached = false;
    var hls = null;

    if (!video || !button || !stream) {
      return;
    }

    function start() {
      if (!attached) {
        hls = attachStream(video, stream);
        attached = true;
      }
      shell.classList.add("is-playing");
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });

    shell.addEventListener("click", function (event) {
      if (event.target === video && attached) {
        return;
      }
      start();
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-video-player]")).forEach(setupPlayer);
  });
})();
