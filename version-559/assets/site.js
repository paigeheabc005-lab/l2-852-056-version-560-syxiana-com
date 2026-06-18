(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.hasAttribute('hidden');
      if (open) {
        menu.removeAttribute('hidden');
      } else {
        menu.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('active', itemIndex === heroIndex);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('active', itemIndex === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var next = Number(dot.getAttribute('data-hero-dot')) || 0;
      showHero(next);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));
  var searchableItems = Array.prototype.slice.call(document.querySelectorAll('[data-filter-text]'));

  function applyFilter(value) {
    var query = String(value || '').trim().toLowerCase();
    searchableItems.forEach(function (item) {
      var text = (item.getAttribute('data-filter-text') || '').toLowerCase();
      item.classList.toggle('is-hidden', query.length > 0 && text.indexOf(query) === -1);
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilter(input.value);
    });
  });

  var pageSearch = document.querySelector('[data-search-page]');
  if (pageSearch) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    pageSearch.value = query;
    applyFilter(query);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      var value = chip.getAttribute('data-filter-chip') || '';
      searchInputs.forEach(function (input) {
        input.value = value;
      });
      applyFilter(value);
    });
  });
})();
