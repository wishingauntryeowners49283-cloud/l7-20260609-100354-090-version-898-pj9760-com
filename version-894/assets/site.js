(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var navToggle = qs('[data-nav-toggle]');
  var siteNav = qs('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-dot]');
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === heroIndex);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var keywordInput = qs('[data-filter-keyword]');
  var categoryInput = qs('[data-filter-category]');
  var yearInput = qs('[data-filter-year]');
  var resetButton = qs('[data-filter-reset]');
  var countNode = qs('[data-result-count]');
  var cards = qsa('[data-card-list] .movie-card');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(keywordInput && keywordInput.value);
    var category = normalize(categoryInput && categoryInput.value);
    var year = normalize(yearInput && yearInput.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' '));

      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (category && normalize(card.getAttribute('data-category')) !== category) {
        matched = false;
      }

      if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) {
        matched = false;
      }

      card.classList.toggle('is-filtered-out', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (countNode) {
      countNode.textContent = visible + ' 部';
    }
  }

  [keywordInput, categoryInput, yearInput].forEach(function (node) {
    if (node) {
      node.addEventListener('input', applyFilter);
      node.addEventListener('change', applyFilter);
    }
  });

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      if (keywordInput) {
        keywordInput.value = '';
      }

      if (categoryInput) {
        categoryInput.value = '';
      }

      if (yearInput) {
        yearInput.value = '';
      }

      applyFilter();
    });
  }

  applyFilter();

  var video = qs('[data-video-url]');
  var playerReady = false;

  function setupPlayer() {
    if (!video || playerReady) {
      return;
    }

    var src = video.getAttribute('data-video-url');

    if (!src) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      playerReady = true;
      return;
    }

    video.src = src;
    playerReady = true;
  }

  function startPlayer() {
    if (!video) {
      return;
    }

    setupPlayer();

    var playLayer = qs('.play-layer');

    if (playLayer) {
      playLayer.classList.add('is-hidden');
    }

    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (video) {
    setupPlayer();
    video.addEventListener('play', function () {
      var playLayer = qs('.play-layer');

      if (playLayer) {
        playLayer.classList.add('is-hidden');
      }
    });
  }

  qsa('[data-play-target]').forEach(function (button) {
    button.addEventListener('click', startPlayer);
  });
})();
