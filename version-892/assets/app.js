(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.getElementById('mobileNav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
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

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var typeFilter = document.querySelector('[data-filter-type]');
    var yearFilter = document.querySelector('[data-filter-year]');
    var scope = document.querySelector('[data-search-scope]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (searchInput && scope) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            searchInput.value = query;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(searchInput.value);
            var typeValue = typeFilter ? typeFilter.value : '';
            var yearValue = yearFilter ? yearFilter.value : '';
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }

                if (yearValue && cardYear !== yearValue) {
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

        searchInput.addEventListener('input', applyFilters);

        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilters);
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilters);
        }

        applyFilters();
    }
})();
