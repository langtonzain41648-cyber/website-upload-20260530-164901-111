(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobilePanel.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
            mobilePanel.setAttribute('aria-hidden', String(!isOpen));
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;

        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var grid = document.getElementById('movieGrid');
    var searchInput = document.getElementById('localSearch');
    var typeFilter = document.getElementById('typeFilter');
    var yearFilter = document.getElementById('yearFilter');
    var emptyState = document.getElementById('emptyState');

    if (grid && searchInput) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card-item'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        searchInput.value = initialQuery;

        var normalize = function (value) {
            return String(value || '').toLowerCase().trim();
        };

        var applyFilters = function () {
            var query = normalize(searchInput.value);
            var typeValue = typeFilter ? normalize(typeFilter.value) : '';
            var yearValue = yearFilter ? normalize(yearFilter.value) : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.textContent);
                var type = normalize(card.getAttribute('data-type'));
                var year = normalize(card.getAttribute('data-year'));
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchType = !typeValue || type.indexOf(typeValue) !== -1;
                var matchYear = !yearValue || year === yearValue;
                var show = matchQuery && matchType && matchYear;

                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        };

        searchInput.addEventListener('input', applyFilters);
        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilters);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilters);
        }
        applyFilters();
    }
})();
