
(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
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

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        startTimer();

        var searchInput = document.querySelector(".site-search");
        var categoryFilter = document.querySelector(".category-filter");
        var yearFilter = document.querySelector(".year-filter");
        var typeFilter = document.querySelector(".type-filter");
        var list = document.querySelector(".searchable-list") || document.querySelector(".ranking-list");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));

        function getParam(name) {
            var params = new URLSearchParams(window.location.search);
            return params.get(name) || "";
        }

        if (searchInput) {
            searchInput.value = getParam("q");
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(searchInput ? searchInput.value : "");
            var category = categoryFilter ? categoryFilter.value : "";
            var year = yearFilter ? yearFilter.value : "";
            var type = typeFilter ? typeFilter.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.category,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.tags,
                    card.textContent
                ].join(" "));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesCategory = !category || card.dataset.category === category;
                var matchesYear = !year || card.dataset.year === year;
                var matchesType = !type || card.dataset.type === type;
                var matched = matchesKeyword && matchesCategory && matchesYear && matchesType;

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (list) {
                list.classList.toggle("is-empty", visible === 0);
            }
        }

        [searchInput, categoryFilter, yearFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (cards.length) {
            applyFilters();
        }
    });
})();
