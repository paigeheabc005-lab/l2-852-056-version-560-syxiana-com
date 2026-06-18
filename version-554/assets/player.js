(function () {
    window.initPlayer = function (source) {
        var video = document.getElementById('playerVideo');
        var overlay = document.getElementById('playerOverlay');
        var button = document.getElementById('playerButton');
        var hlsInstance = null;
        var loaded = false;

        function load() {
            if (!video || loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            if (!video) {
                return;
            }
            load();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var played = video.play();
            if (played && typeof played.catch === 'function') {
                played.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('ended', function () {
                if (hlsInstance) {
                    hlsInstance.stopLoad();
                }
            });
        }
    };
})();
