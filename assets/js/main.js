(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.querySelector("#mobile-menu");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("open", !expanded);
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll("[data-fallback-image]");

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        var holder = image.closest(".poster-shell, .hero-slide, .category-bg, .category-preview-grid span");
        if (holder) {
          holder.classList.add("poster-missing", "hero-missing");
        }
      }, { once: true });
    });
  }

  function setupLocalFilters() {
    var inputs = document.querySelectorAll("[data-card-filter], [data-type-filter], [data-year-filter]");

    function apply(targetSelector) {
      var container = document.querySelector(targetSelector);
      if (!container) {
        return;
      }

      var textInput = document.querySelector('[data-card-filter][data-target="' + targetSelector + '"]');
      var typeSelect = document.querySelector('[data-type-filter][data-target="' + targetSelector + '"]');
      var yearSelect = document.querySelector('[data-year-filter][data-target="' + targetSelector + '"]');
      var text = normalize(textInput && textInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var cards = container.querySelectorAll("[data-movie-card]");

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute("data-search"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (text && searchText.indexOf(text) === -1) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle("hidden-by-filter", !matched);
      });
    }

    inputs.forEach(function (input) {
      var target = input.getAttribute("data-target");
      if (!target) {
        return;
      }
      input.addEventListener("input", function () {
        apply(target);
      });
      input.addEventListener("change", function () {
        apply(target);
      });
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var input = document.querySelector("[data-search-input]");

    if (!results || !summary || !input || !window.MOVIE_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function card(movie) {
      var tags = Array.isArray(movie.tags) ? movie.tags.join(" ") : "";
      return [
        '<article class="movie-card" data-movie-card>',
        '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <span class="poster-shell">',
        '      <span class="poster-fallback">国产高清影片</span>',
        '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" data-fallback-image>',
        '    </span>',
        '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
        '    <span class="play-chip">立即观看</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-card-line">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-meta-row">',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(tags.split(" ")[0] || movie.genre) + '</span>',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function runSearch(value) {
      var q = normalize(value);
      if (!q) {
        results.innerHTML = "";
        summary.textContent = "请输入关键词开始搜索。";
        return;
      }

      var matched = window.MOVIE_DATA.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          Array.isArray(movie.tags) ? movie.tags.join(" ") : ""
        ].join(" "));
        return text.indexOf(q) !== -1;
      }).slice(0, 120);

      summary.textContent = "共找到 " + matched.length + " 条相关结果" + (matched.length >= 120 ? "，已显示前 120 条。" : "。");
      results.innerHTML = matched.map(card).join("\n");
      setupImageFallbacks();
    }

    input.addEventListener("input", function () {
      runSearch(input.value);
    });

    runSearch(query);
  }

  function setupPlayers() {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (player) {
      var video = player.querySelector("video[data-video-source]");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var hls = null;
      var hasLoaded = false;

      if (!video || !button) {
        return;
      }

      function setStatus(message, visible) {
        if (!status) {
          return;
        }
        status.textContent = message || "";
        status.classList.toggle("show", Boolean(visible && message));
      }

      function loadSource() {
        if (hasLoaded) {
          return;
        }

        var source = video.getAttribute("data-video-source");
        hasLoaded = true;
        setStatus("正在初始化播放源...", true);

        if (!source) {
          setStatus("当前影片未配置播放源。", true);
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setStatus("播放源已就绪。", true);
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪。", true);
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放加载遇到问题，可刷新页面后重试。", true);
            }
          });
          return;
        }

        video.src = source;
        setStatus("浏览器将尝试直接播放 HLS 源。", true);
      }

      function play() {
        loadSource();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            setStatus("请再次点击播放按钮开始播放。", true);
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        setStatus("", false);
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("waiting", function () {
        setStatus("缓冲中...", true);
      });
      video.addEventListener("canplay", function () {
        setStatus("", false);
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupImageFallbacks();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
