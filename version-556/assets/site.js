(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;
      var show = function (next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          show(parseInt(dot.getAttribute("data-hero-dot"), 10));
          start();
        });
      });
      start();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var category = scope.querySelector("[data-category-filter]");
      var reset = scope.querySelector("[data-filter-reset]");
      var empty = scope.querySelector("[data-filter-empty]");
      var grid = scope.nextElementSibling;
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
      if (input && query) {
        input.value = query;
      }
      var filter = function () {
        var q = normalize(input ? input.value : "");
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var c = category ? category.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }
          if (t && card.getAttribute("data-type") !== t) {
            ok = false;
          }
          if (c && card.getAttribute("data-category") !== c) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      };
      [input, year, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filter);
          control.addEventListener("change", filter);
        }
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          if (category) {
            category.value = "";
          }
          filter();
        });
      }
      filter();
    });
  });
})();
