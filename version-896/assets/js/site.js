(function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", panel.classList.contains("is-open"));
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function startCarousel() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        startCarousel();
      });
    });

    carousel.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });

    carousel.addEventListener("mouseleave", startCarousel);
    startCarousel();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]")).forEach(function (filterRoot) {
    var input = filterRoot.querySelector("[data-search-input]");
    var typeSelect = filterRoot.querySelector("[data-type-filter]");
    var yearSelect = filterRoot.querySelector("[data-year-filter]");
    var scope = filterRoot.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var typeValue = typeSelect ? typeSelect.value : "";
      var yearValue = yearSelect ? yearSelect.value : "";

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search-text") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
        var matchedYear = !yearValue || cardYear === yearValue;

        card.classList.toggle("is-hidden", !(matchedKeyword && matchedType && matchedYear));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilters);
    }
  });
})();
