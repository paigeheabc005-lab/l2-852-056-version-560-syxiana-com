(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) return;
    var index = 0;
    function activate(next) {
      slides[index].classList.remove("is-active");
      if (dots[index]) dots[index].classList.remove("is-active");
      index = next;
      slides[index].classList.add("is-active");
      if (dots[index]) dots[index].classList.add("is-active");
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        activate(i);
      });
    });
    window.setInterval(function () {
      activate((index + 1) % slides.length);
    }, 5600);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMovieFilters() {
    var search = document.querySelector("[data-movie-search]");
    var region = document.querySelector("[data-region-filter]");
    var type = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) return;
    function run() {
      var keyword = normalize(search && search.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-genre"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) matched = false;
        if (regionValue && cardRegion.indexOf(regionValue) === -1) matched = false;
        if (typeValue && cardType.indexOf(typeValue) === -1) matched = false;
        card.style.display = matched ? "" : "none";
        if (matched) visible += 1;
      });
      if (empty) empty.classList.toggle("is-visible", visible === 0);
    }
    [search, region, type].forEach(function (el) {
      if (el) el.addEventListener("input", run);
      if (el) el.addEventListener("change", run);
    });
  }

  window.initMoviePlayer = function (src) {
    var video = document.querySelector(".movie-player-video");
    var overlay = document.querySelector(".player-overlay");
    var playButton = document.querySelector(".player-play-button");
    var attached = false;
    if (!video || !src) return;
    function attach() {
      if (attached) return;
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }
    function start() {
      attach();
      video.controls = true;
      if (overlay) overlay.classList.add("is-hidden");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          video.controls = true;
        });
      }
    }
    if (overlay) overlay.addEventListener("click", start);
    if (playButton) playButton.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) start();
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupMovieFilters();
  });
})();
