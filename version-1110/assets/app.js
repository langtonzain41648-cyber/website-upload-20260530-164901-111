(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var index = 0;
    var activate = function (next) {
      slides[index].classList.remove('is-active');
      if (dots[index]) {
        dots[index].classList.remove('is-active');
      }
      index = next;
      slides[index].classList.add('is-active');
      if (dots[index]) {
        dots[index].classList.add('is-active');
      }
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });
    setInterval(function () {
      activate((index + 1) % slides.length);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  var keywordInput = document.querySelector('[data-filter-keyword]');
  if (query && keywordInput) {
    keywordInput.value = query;
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var root = panel.closest('main') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var noResults = root.querySelector('[data-no-results]');
    var keyword = panel.querySelector('[data-filter-keyword]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var reset = panel.querySelector('[data-filter-reset]');

    var normalize = function (value) {
      return (value || '').toString().trim().toLowerCase();
    };

    var apply = function () {
      var key = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = true;
        if (key && haystack.indexOf(key) === -1) {
          ok = false;
        }
        if (y && normalize(card.getAttribute('data-year')) !== y) {
          ok = false;
        }
        if (r && normalize(card.getAttribute('data-region')) !== r) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    };

    if (keyword) {
      keyword.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (region) {
      region.addEventListener('change', apply);
    }
    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (region) {
          region.value = '';
        }
        apply();
      });
    }
    apply();
  });
})();
