(function () {
  "use strict";

  function rootPrefix() {
    var depth = Number(document.body.getAttribute("data-depth") || 0);
    return "../".repeat(depth);
  }

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = $("[data-menu-toggle]");
    var nav = $("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    var slides = $all("[data-hero-slide]");
    var dots = $all("[data-hero-dot]");
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    var hero = $(".hero-slider");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }

    show(0);
    start();
  }

  function setupPageFilter() {
    var list = $("[data-filter-list]");
    var keywordInput = $("#page-filter-keyword");
    var yearSelect = $("#page-filter-year");
    var resetButton = $("[data-reset-filter]");
    var countLabel = $("[data-filter-count]");
    var emptyState = $("[data-empty-state]");

    if (!list || !keywordInput) {
      return;
    }

    var cards = $all("[data-movie-card]", list);

    function applyFilter() {
      var keyword = normalize(keywordInput.value);
      var year = yearSelect ? normalize(yearSelect.value) : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" "));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear.indexOf(year) !== -1;
        var matched = matchedKeyword && matchedYear;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (countLabel) {
        countLabel.textContent = "当前显示 " + visible + " / " + cards.length + " 部";
      }
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    keywordInput.addEventListener("input", applyFilter);
    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        keywordInput.value = "";
        if (yearSelect) {
          yearSelect.value = "";
        }
        applyFilter();
      });
    }

    applyFilter();
  }

  function renderQuickResults(container, items) {
    var prefix = rootPrefix();
    if (!items.length) {
      container.innerHTML = "<div class=\"quick-result-item\"><div></div><div><strong>没有找到匹配影片</strong><small>请尝试更换关键词</small></div></div>";
      container.hidden = false;
      return;
    }

    container.innerHTML = items.slice(0, 12).map(function (item) {
      return [
        "<a class=\"quick-result-item\" href=\"" + prefix + item.url + "\">",
        "<img src=\"" + prefix + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\">",
        "<span><strong>" + escapeHtml(item.title) + "</strong><small>" + escapeHtml(item.year + " · " + item.region + " · " + item.type) + "</small></span>",
        "<small>立即观看</small>",
        "</a>"
      ].join("");
    }).join("");
    container.hidden = false;
  }

  function setupGlobalSearch() {
    var input = $("#global-search-input");
    var results = $("#global-search-results");
    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    input.addEventListener("input", function () {
      var keyword = normalize(input.value);
      if (!keyword) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }

      var items = window.MOVIE_SEARCH_DATA.filter(function (item) {
        return normalize(item.searchText).indexOf(keyword) !== -1;
      });
      renderQuickResults(results, items);
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".quick-search")) {
        results.hidden = true;
      }
    });
  }

  function setupSearchPage() {
    var input = $("#search-page-input");
    var results = $("#search-page-results");
    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var prefix = rootPrefix();

    function render(items) {
      if (!items.length) {
        results.innerHTML = "<p class=\"empty-state\">没有找到匹配影片，请尝试更换关键词。</p>";
        return;
      }

      results.innerHTML = items.slice(0, 80).map(function (item) {
        return [
          "<article class=\"search-page-result\">",
          "<img src=\"" + prefix + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\">",
          "<div><h3><a href=\"" + prefix + item.url + "\">" + escapeHtml(item.title) + "</a></h3>",
          "<p>" + escapeHtml(item.year + " · " + item.region + " · " + item.type + " · " + item.category) + "</p></div>",
          "<a class=\"text-link\" href=\"" + prefix + item.url + "\">播放</a>",
          "</article>"
        ].join("");
      }).join("");
    }

    input.addEventListener("input", function () {
      var keyword = normalize(input.value);
      if (!keyword) {
        results.innerHTML = "";
        return;
      }
      var items = window.MOVIE_SEARCH_DATA.filter(function (item) {
        return normalize(item.searchText).indexOf(keyword) !== -1;
      });
      render(items);
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayers() {
    $all("[data-player-shell]").forEach(function (shell) {
      var video = $("video[data-video-src]", shell);
      var button = $("[data-player-start]", shell);
      var status = $("[data-player-status]", shell);
      if (!video || !button) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || "";
        }
      }

      function startPlayback() {
        var source = video.getAttribute("data-video-src");
        if (!source) {
          setStatus("当前影片未绑定播放源");
          return;
        }

        button.classList.add("is-hidden");
        setStatus("正在初始化 HLS 播放器…");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.src) {
            video.src = source;
          }
          video.play().then(function () {
            setStatus("");
          }).catch(function () {
            setStatus("浏览器阻止了自动播放，请再次点击播放按钮或视频控件。");
            button.classList.remove("is-hidden");
          });
          return;
        }

        loadHls(function () {
          if (!window.Hls || !window.Hls.isSupported()) {
            setStatus("当前浏览器不支持 HLS 播放，请更换浏览器。");
            button.classList.remove("is-hidden");
            return;
          }

          if (!video._hlsInstance) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            video._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setStatus("");
              video.play().catch(function () {
                setStatus("播放器已就绪，请点击视频控件开始播放。");
                button.classList.remove("is-hidden");
              });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus("视频加载失败，请稍后重试。");
                button.classList.remove("is-hidden");
              }
            });
          } else {
            video.play().then(function () {
              setStatus("");
            }).catch(function () {
              setStatus("请点击视频控件开始播放。");
              button.classList.remove("is-hidden");
            });
          }
        });
      }

      button.addEventListener("click", startPlayback);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (!video.currentTime) {
          button.classList.remove("is-hidden");
        }
      });
    });
  }

  function setupImageFallbacks() {
    $all("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.opacity = "0";
      }, { once: true });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHeroSlider();
    setupPageFilter();
    setupGlobalSearch();
    setupSearchPage();
    setupPlayers();
    setupImageFallbacks();
  });
})();
