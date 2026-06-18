(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var index = 0;
            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            if (slides.length > 1) {
                setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
        }

        var root = document.querySelector(".movie-filter-root");
        var target = document.querySelector(".filter-target");
        if (root && target) {
            var text = root.querySelector('[data-filter="text"]');
            var year = root.querySelector('[data-filter="year"]');
            var region = root.querySelector('[data-filter="region"]');
            var empty = document.querySelector(".empty-state");
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (q && text) {
                text.value = q;
            }
            function normalize(value) {
                return (value || "").toString().trim().toLowerCase();
            }
            function apply() {
                var qv = normalize(text && text.value);
                var yv = normalize(year && year.value);
                var rv = normalize(region && region.value);
                var visible = 0;
                Array.prototype.forEach.call(target.children, function (card) {
                    if (!card.matches("[data-title]")) {
                        return;
                    }
                    var hay = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-keywords"));
                    var cy = normalize(card.getAttribute("data-year"));
                    var cr = normalize(card.getAttribute("data-region"));
                    var ok = (!qv || hay.indexOf(qv) !== -1) && (!yv || cy === yv) && (!rv || cr.indexOf(rv) !== -1);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [text, year, region].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
            apply();
        }
    });

    window.initMoviePlayer = function (stream) {
        var wrap = document.getElementById("movie-player-wrap");
        var video = document.getElementById("movie-player");
        var cover = wrap ? wrap.querySelector(".player-cover") : null;
        if (!wrap || !video || !stream) {
            return;
        }
        var loaded = false;
        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }
        function start() {
            attach();
            wrap.classList.add("is-playing");
            var play = video.play();
            if (play && typeof play.catch === "function") {
                play.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            wrap.classList.add("is-playing");
        });
    };
})();
