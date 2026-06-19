const MovieSite = (() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initMenu() {
    const button = $('[data-menu-button]');
    const nav = $('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    const slider = $('[data-hero-slider]');
    if (!slider) {
      return;
    }
    const slides = $$('[data-hero-slide]', slider);
    const dots = $$('[data-hero-dot]', slider);
    const prev = $('[data-hero-prev]', slider);
    const next = $('[data-hero-next]', slider);
    let index = slides.findIndex(slide => slide.classList.contains('is-active'));
    if (index < 0) {
      index = 0;
    }

    const show = nextIndex => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    prev?.addEventListener('click', () => show(index - 1));
    next?.addEventListener('click', () => show(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

    window.setInterval(() => {
      if (!document.hidden) {
        show(index + 1);
      }
    }, 6200);
  }

  function initFilters() {
    const form = $('[data-filter-form]');
    const list = $('[data-filter-list]');
    if (!form || !list) {
      return;
    }
    const keyword = $('[data-filter-keyword]', form);
    const year = $('[data-filter-year]', form);
    const type = $('[data-filter-type]', form);
    const region = $('[data-filter-region]', form);
    const cards = $$('[data-card]', list);

    const apply = () => {
      const key = (keyword?.value || '').trim().toLowerCase();
      const y = year?.value || '';
      const t = type?.value || '';
      const r = region?.value || '';
      cards.forEach(card => {
        const matchedKeyword = !key || (card.dataset.search || '').includes(key);
        const matchedYear = !y || card.dataset.year === y;
        const matchedType = !t || card.dataset.type === t;
        const matchedRegion = !r || card.dataset.region === r;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedType && matchedRegion));
      });
    };

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
  }

  function initSearch() {
    const page = $('[data-search-page]');
    if (!page || !Array.isArray(window.MovieSearchIndex)) {
      return;
    }
    const input = $('[data-search-input]', page);
    const year = $('[data-search-year]', page);
    const type = $('[data-search-type]', page);
    const region = $('[data-search-region]', page);
    const results = $('[data-search-results]', page);
    const index = window.MovieSearchIndex;

    const addOptions = (select, values) => {
      values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    };

    addOptions(year, [...new Set(index.map(item => String(item.year)))].sort((a, b) => Number(b) - Number(a)).slice(0, 40));
    addOptions(type, [...new Set(index.map(item => item.type))].sort());
    addOptions(region, [...new Set(index.map(item => item.region))].sort());

    const card = item => `
        <article class="movie-card poster">
          <a class="poster-wrap" href="${item.url}">
            <img src="${item.cover}" alt="${escapeHTML(item.title)}" loading="lazy">
            <span class="card-overlay"></span>
            <span class="play-badge">▶</span>
            <span class="year-badge">${item.year}</span>
          </a>
          <div class="card-body">
            <div class="tag-row"><span>${escapeHTML(item.category)}</span></div>
            <h3><a href="${item.url}">${escapeHTML(item.title)}</a></h3>
            <p>${escapeHTML(item.oneLine)}</p>
            <div class="card-meta"><span>★ ${item.rating}</span><span>${escapeHTML(item.region)}</span></div>
          </div>
        </article>`;

    const render = () => {
      const key = (input.value || '').trim().toLowerCase();
      const y = year.value;
      const t = type.value;
      const r = region.value;
      const filtered = index.filter(item => {
        const search = `${item.title} ${item.region} ${item.type} ${item.genre} ${item.category} ${item.oneLine}`.toLowerCase();
        return (!key || search.includes(key)) && (!y || String(item.year) === y) && (!t || item.type === t) && (!r || item.region === r);
      }).slice(0, 80);
      results.innerHTML = filtered.map(card).join('');
    };

    page.addEventListener('input', render);
    page.addEventListener('change', render);
    render();
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function initPlayer(streamUrl) {
    const video = document.getElementById('movie-player');
    const cover = document.getElementById('player-cover');
    if (!video || !cover || !streamUrl) {
      return;
    }

    let attached = false;
    const attach = () => {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    };

    const start = () => {
      attach();
      cover.classList.add('is-hidden');
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          cover.classList.remove('is-hidden');
        });
      }
    };

    cover.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initHero();
    initFilters();
    initSearch();
  });

  return {
    initPlayer
  };
})();
