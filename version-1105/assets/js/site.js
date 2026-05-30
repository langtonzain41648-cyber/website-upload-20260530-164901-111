(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './search.html';

      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }

      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (slides.length > 0) {
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
        });
      });
      showSlide(0);
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchParams = new URLSearchParams(window.location.search);
  var query = searchParams.get('q') || '';
  var searchInput = document.querySelector('[data-page-search]');

  if (searchInput) {
    searchInput.value = query;
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().replace(/\s+/g, '');
  }

  function applyGridFilter(scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var textInput = scope.querySelector('[data-filter-text]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var countNode = scope.querySelector('[data-filter-count]');
    var text = normalize(textInput ? textInput.value : query);
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
      var typeValue = card.getAttribute('data-type') || '';
      var yearValue = card.getAttribute('data-year') || '';
      var matchedText = !text || haystack.indexOf(text) !== -1;
      var matchedType = !type || typeValue === type;
      var matchedYear = !year || yearValue === year;
      var matched = matchedText && matchedType && matchedYear;

      card.classList.toggle('hidden-by-filter', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (countNode) {
      countNode.textContent = String(visible);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var controls = scope.querySelectorAll('[data-filter-text], [data-filter-type], [data-filter-year]');

    controls.forEach(function (control) {
      control.addEventListener('input', function () {
        applyGridFilter(scope);
      });
      control.addEventListener('change', function () {
        applyGridFilter(scope);
      });
    });

    applyGridFilter(scope);
  });

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });
})();
