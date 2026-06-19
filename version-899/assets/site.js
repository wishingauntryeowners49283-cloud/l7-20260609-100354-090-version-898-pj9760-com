(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", panel.classList.contains("is-open"));
        });
    }

    function initSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                }
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activate(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                activate(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                activate(index + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        activate(0);
        start();
    }

    function initPageFilter() {
        var grid = document.querySelector("[data-filter-grid]");
        var input = document.getElementById("page-filter");
        var select = document.getElementById("type-filter");
        if (!grid || !input || !select) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        function apply() {
            var q = input.value.trim().toLowerCase();
            var type = select.value;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardType = card.getAttribute("data-type") || "";
                var matchedText = !q || text.indexOf(q) !== -1;
                var matchedType = !type || cardType === type;
                card.classList.toggle("is-filtered-out", !(matchedText && matchedType));
            });
        }
        input.addEventListener("input", apply);
        select.addEventListener("change", apply);
    }

    function createSearchCard(item) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.innerHTML = [
            "<a class=\"movie-link\" href=\"" + item.url + "\">",
            "<div class=\"poster-box\">",
            "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
            "<div class=\"poster-shade\"></div>",
            "<span class=\"score-badge\">" + item.score + "</span>",
            "<span class=\"play-badge\">▶</span>",
            "</div>",
            "<div class=\"movie-info\">",
            "<h3>" + escapeHtml(item.title) + "</h3>",
            "<p class=\"movie-desc\">" + escapeHtml(item.description) + "</p>",
            "<div class=\"movie-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.year) + "</span></div>",
            "<div class=\"tag-row\"><span>" + escapeHtml(item.category) + "</span><span>" + escapeHtml(item.genre) + "</span></div>",
            "</div>",
            "</a>"
        ].join("");
        return article;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");
        var target = document.getElementById("searchResults");
        if (!page || !target || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        var input = page.querySelector("input[name='q']");
        if (input) {
            input.value = q;
        }
        if (!q) {
            target.innerHTML = "<div class=\"search-empty\">输入关键词后即可浏览相关影片。</div>";
            return;
        }
        var words = q.toLowerCase().split(/\s+/).filter(Boolean);
        var results = window.SEARCH_INDEX.filter(function (item) {
            var haystack = item.search.toLowerCase();
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 120);
        target.innerHTML = "";
        if (!results.length) {
            target.innerHTML = "<div class=\"search-empty\">暂无匹配内容，请尝试其他关键词。</div>";
            return;
        }
        results.forEach(function (item) {
            target.appendChild(createSearchCard(item));
        });
    }

    function initBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        function sync() {
            button.classList.toggle("is-visible", window.scrollY > 360);
        }
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.addEventListener("scroll", sync, { passive: true });
        sync();
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initPageFilter();
        initSearchPage();
        initBackTop();
    });
})();
