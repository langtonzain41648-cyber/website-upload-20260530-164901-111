(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function textOf(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var active = panel.classList.toggle('active');
      document.body.classList.toggle('menu-open', active);
      button.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
  }

  function setupSiteSearch() {
    var forms = document.querySelectorAll('[data-site-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var q = input ? input.value.trim() : '';
        var target = './search.html';
        if (q) {
          target += '?q=' + encodeURIComponent(q);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('active', pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('active', pos === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        show(pos);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFiltering() {
    var input = document.querySelector('[data-filter-input]');
    var grid = document.querySelector('[data-card-grid]');
    var empty = document.querySelector('[data-empty-state]');
    var sort = document.querySelector('[data-sort-select]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function apply() {
      var q = input ? textOf(input.value) : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = textOf(card.getAttribute('data-search'));
        var match = !q || haystack.indexOf(q) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('active', visible === 0);
      }
    }

    function reorder() {
      if (!sort) {
        return;
      }
      var mode = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'views') {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (mode === 'rating') {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        }
        if (mode === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        return Number(a.dataset.id || 0) - Number(b.dataset.id || 0);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
      input.addEventListener('input', apply);
    }
    if (sort) {
      sort.addEventListener('change', reorder);
      reorder();
    } else {
      apply();
    }
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-video-player]');
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      if (!video) {
        return;
      }
      var src = video.getAttribute('data-video');
      if (src) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (!video.currentSrc) {
          video.src = src;
        }
      }

      function playVideo() {
        var action = video.paused ? video.play() : video.pause();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
      video.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('playing');
      });
    });
  }

  ready(function () {
    setupMenu();
    setupSiteSearch();
    setupHero();
    setupFiltering();
    setupPlayers();
  });
})();
