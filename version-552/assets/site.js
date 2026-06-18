(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function next() {
        show(current + 1);
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(next, 5000);
      }

      var prevButton = hero.querySelector('[data-hero-prev]');
      var nextButton = hero.querySelector('[data-hero-next]');
      if (prevButton) {
        prevButton.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }
      if (nextButton) {
        nextButton.addEventListener('click', function () {
          next();
          restart();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          restart();
        });
      });
      show(0);
      restart();
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var searchInput = document.querySelector('[data-filter-search]');
    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    var filterList = document.querySelector('[data-filter-list]');
    if (filterList) {
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('.js-movie-card'));
      var yearSelect = document.querySelector('[data-filter-year]');
      var regionSelect = document.querySelector('[data-filter-region]');
      var genreSelect = document.querySelector('[data-filter-genre]');
      var resetButton = document.querySelector('[data-filter-reset]');
      var emptyState = document.querySelector('[data-empty-state]');

      function applyFilters() {
        var q = normalize(searchInput ? searchInput.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var genre = normalize(genreSelect ? genreSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.genre,
            card.dataset.region,
            card.dataset.year,
            card.textContent
          ].join(' '));
          var matched = true;
          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }
          if (year && normalize(card.dataset.year) !== year) {
            matched = false;
          }
          if (region && normalize(card.dataset.region) !== region) {
            matched = false;
          }
          if (genre && haystack.indexOf(genre) === -1) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle('is-visible', visible === 0);
        }
      }

      [searchInput, yearSelect, regionSelect, genreSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (searchInput) {
            searchInput.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          if (regionSelect) {
            regionSelect.value = '';
          }
          if (genreSelect) {
            genreSelect.value = '';
          }
          applyFilters();
        });
      }

      applyFilters();
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-button]');
      var url = player.getAttribute('data-play');

      function start() {
        if (!video || !url) {
          return;
        }
        if (player.dataset.ready === '1') {
          video.play().catch(function () {});
          return;
        }
        player.dataset.ready = '1';
        if (button) {
          button.classList.add('is-hidden');
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = url;
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          start();
        });
      }
      player.addEventListener('click', function (event) {
        if (event.target === video && player.dataset.ready === '1') {
          return;
        }
        start();
      });
    });
  });
})();
