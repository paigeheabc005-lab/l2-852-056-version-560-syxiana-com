(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function initHeader() {
    var searchToggle = byId("search-toggle");
    var searchPanel = byId("search-panel");
    var menuToggle = byId("menu-toggle");
    var mobileNav = byId("mobile-nav");

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener("click", function () {
        searchPanel.classList.toggle("is-open");
        var input = byId("site-search-input");
        if (searchPanel.classList.contains("is-open") && input) {
          input.focus();
        }
      });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }
  }

  function initSearch() {
    var input = byId("site-search-input");
    var results = byId("site-search-results");
    if (!input || !results || !window.SEARCH_INDEX) {
      return;
    }

    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      results.innerHTML = "";
      if (!value) {
        results.classList.remove("is-open");
        return;
      }

      var matches = window.SEARCH_INDEX.filter(function (item) {
        return item.title.toLowerCase().indexOf(value) !== -1 ||
          item.category.toLowerCase().indexOf(value) !== -1 ||
          item.tags.toLowerCase().indexOf(value) !== -1 ||
          item.year.toLowerCase().indexOf(value) !== -1;
      }).slice(0, 8);

      matches.forEach(function (item) {
        var link = document.createElement("a");
        link.className = "search-result-item";
        link.href = item.url;
        link.innerHTML = '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '"><span><strong>' + item.title + '</strong><small>' + item.year + ' · ' + item.category + '</small></span>';
        results.appendChild(link);
      });

      results.classList.toggle("is-open", matches.length > 0);
    });
  }

  function initHero() {
    var carousel = byId("hero-carousel");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function initCatalogFilters() {
    var page = document.querySelector(".catalog-page");
    if (!page) {
      return;
    }

    var input = page.querySelector(".catalog-search-input");
    var chips = Array.prototype.slice.call(page.querySelectorAll(".filter-chip"));
    var cards = Array.prototype.slice.call(page.querySelectorAll(".catalog-grid .movie-card"));
    var active = "all";

    function filterCards() {
      var value = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" ").toLowerCase();
        var typeText = (card.getAttribute("data-type") || "") + " " + (card.getAttribute("data-year") || "");
        var passText = !value || haystack.indexOf(value) !== -1;
        var passChip = active === "all" || typeText.indexOf(active) !== -1 || haystack.indexOf(active.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(passText && passChip));
      });
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        active = chip.getAttribute("data-filter") || "all";
        filterCards();
      });
    });
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (window.__hlsLoadingPromise) {
      return window.__hlsLoadingPromise;
    }

    window.__hlsLoadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return window.__hlsLoadingPromise;
  }

  function initPlayer() {
    var video = byId("movie-video");
    var overlay = byId("player-overlay");
    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-hls") || "";
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached || !stream) {
        return Promise.resolve();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        attached = true;
        return Promise.resolve();
      }

      return loadHlsLibrary().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          attached = true;
          return;
        }
        video.src = stream;
        attached = true;
      });
    }

    function playVideo() {
      attach().then(function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      });
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initHeader();
    initSearch();
    initHero();
    initCatalogFilters();
    initPlayer();
  });
})();
