(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("mouseenter", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function searchBasePath() {
    var path = window.location.pathname;
    if (path.indexOf("/movies/") !== -1 || path.indexOf("/category/") !== -1 || path.indexOf("/catalog/") !== -1) {
      return "../";
    }
    return "./";
  }

  function renderSearchResults(panel, query) {
    var data = window.SEARCH_INDEX || [];
    var base = searchBasePath();
    var value = query.trim().toLowerCase();
    if (!value) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }
    var results = data.filter(function (item) {
      return [item.title, item.category, item.year, item.region, item.genre, item.oneLine].join(" ").toLowerCase().indexOf(value) !== -1;
    }).slice(0, 12);

    if (!results.length) {
      panel.innerHTML = '<div class="search-result"><div></div><div><strong>没有找到相关影片</strong><span>请尝试其他关键词</span></div></div>';
      panel.classList.add("is-open");
      return;
    }

    panel.innerHTML = results.map(function (item) {
      return [
        '<a class="search-result" href="' + base + item.url + '">',
        '<img src="' + base + item.cover + '" alt="' + escapeHtml(item.title) + '">',
        '<div>',
        '<strong>' + escapeHtml(item.title) + '</strong>',
        '<span>' + escapeHtml(item.year + " · " + item.region + " · " + item.genre) + '</span>',
        '</div>',
        '</a>'
      ].join("");
    }).join("");
    panel.classList.add("is-open");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var panel = form.querySelector("[data-search-panel]");
      if (!input || !panel) {
        return;
      }
      input.addEventListener("input", function () {
        renderSearchResults(panel, input.value);
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        renderSearchResults(panel, input.value);
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
    grids.forEach(function (grid) {
      var section = grid.closest("section");
      var chips = section ? Array.prototype.slice.call(section.querySelectorAll("[data-filter-chip]")) : [];
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var value = chip.getAttribute("data-filter-chip");
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          cards.forEach(function (card) {
            var title = card.getAttribute("data-title") || "";
            var visible = value === "all" || title.indexOf(value) !== -1 || card.textContent.indexOf(value) !== -1;
            card.style.display = visible ? "" : "none";
          });
        });
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearch();
    setupFilters();
  });
})();
