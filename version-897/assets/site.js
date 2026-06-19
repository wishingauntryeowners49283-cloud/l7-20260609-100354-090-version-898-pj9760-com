function initMobileNav() {
  var button = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
}

function initHero() {
  var root = document.querySelector('[data-hero]');
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) {
    return;
  }
  var index = 0;
  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var next = Number(dot.getAttribute('data-hero-dot'));
      show(next);
    });
  });
  window.setInterval(function () {
    show(index + 1);
  }, 5200);
}

function initCardFilters() {
  var searchInput = document.querySelector('[data-card-search]');
  var typeSelect = document.querySelector('[data-card-type]');
  var yearSelect = document.querySelector('[data-card-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  if (!searchInput && !typeSelect && !yearSelect) {
    return;
  }
  var queryInput = document.querySelector('[data-search-from-query]');
  if (queryInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      queryInput.value = q;
    }
  }
  function valueOf(element) {
    return element ? element.value.trim().toLowerCase() : '';
  }
  function apply() {
    var q = valueOf(searchInput);
    var type = valueOf(typeSelect);
    var year = valueOf(yearSelect);
    cards.forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      var cardType = (card.getAttribute('data-type') || '').toLowerCase();
      var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
      var matchQuery = !q || title.indexOf(q) !== -1 || keywords.indexOf(q) !== -1;
      var matchType = !type || cardType === type;
      var matchYear = !year || cardYear === year;
      card.style.display = matchQuery && matchType && matchYear ? '' : 'none';
    });
  }
  [searchInput, typeSelect, yearSelect].forEach(function (element) {
    if (element) {
      element.addEventListener('input', apply);
      element.addEventListener('change', apply);
    }
  });
  apply();
}

function initPlayer() {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play-button]');
  if (!video || !button) {
    return;
  }
  var source = video.getAttribute('data-src');
  var prepared = false;
  function prepare() {
    if (prepared || !source) {
      return;
    }
    prepared = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }
  function play() {
    prepare();
    video.controls = true;
    button.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }
  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.controls || video.currentTime === 0) {
      button.classList.remove('is-hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initHero();
  initCardFilters();
  initPlayer();
});
