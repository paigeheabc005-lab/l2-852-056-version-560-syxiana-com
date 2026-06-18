(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.nav-links');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
            slide.classList.toggle('active', position === current);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle('active', position === current);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                showSlide(position);
            });
        });
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    function valueOf(element) {
        return element ? String(element.value || '').trim().toLowerCase() : '';
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year')
        ].join(' ').toLowerCase();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-block]')).forEach(function (block) {
        var input = block.querySelector('[data-filter-input]');
        var region = block.querySelector('[data-filter-region]');
        var type = block.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(block.querySelectorAll('[data-card]'));
        var empty = block.querySelector('[data-empty-state]');

        function apply() {
            var keyword = valueOf(input);
            var regionValue = valueOf(region);
            var typeValue = valueOf(type);
            var shown = 0;

            cards.forEach(function (card) {
                var allText = textOf(card);
                var regionText = String(card.getAttribute('data-region') || '').toLowerCase();
                var typeText = String(card.getAttribute('data-type') || '').toLowerCase();
                var matched = true;

                if (keyword && allText.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (regionValue && regionText.indexOf(regionValue) === -1) {
                    matched = false;
                }
                if (typeValue && typeText.indexOf(typeValue) === -1) {
                    matched = false;
                }

                card.classList.toggle('is-filter-hidden', !matched);
                if (matched) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        [input, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });
})();
