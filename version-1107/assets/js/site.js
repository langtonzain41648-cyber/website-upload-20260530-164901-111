(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = $('[data-mobile-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    $all('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function yearMatches(value, year) {
    if (!value) {
      return true;
    }
    if (value === '全部年份') {
      return true;
    }
    var number = parseInt(year, 10);
    if (value === '2010-2019') {
      return number >= 2010 && number <= 2019;
    }
    if (value === '2000-2009') {
      return number >= 2000 && number <= 2009;
    }
    return String(year) === value;
  }

  function initFilters() {
    var panel = $('[data-filter-panel]');
    var grid = $('[data-card-grid]');
    if (!panel || !grid) {
      return;
    }
    var input = $('[data-filter-input]', panel);
    var year = $('[data-filter-year]', panel);
    var type = $('[data-filter-type]', panel);
    var cards = $all('[data-card]', grid);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }
    function apply() {
      var text = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-text') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var visible = true;
        if (text && haystack.indexOf(text) === -1) {
          visible = false;
        }
        if (!yearMatches(yearValue, cardYear)) {
          visible = false;
        }
        if (typeValue && cardType.indexOf(typeValue) === -1 && cardGenre.indexOf(typeValue) === -1) {
          visible = false;
        }
        card.classList.toggle('is-hidden', !visible);
      });
    }
    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function startPlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var overlay = $('.player-overlay');
    if (!video || !streamUrl) {
      return;
    }
    var attached = false;
    var hlsInstance = null;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.setAttribute('controls', 'controls');
    }
    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSearchForms();
    initFilters();
    initHero();
  });

  window.SitePlayer = {
    start: startPlayer
  };
})();
