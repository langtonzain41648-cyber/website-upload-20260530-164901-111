(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector('.mobile-toggle');
        var menu = document.querySelector('.mobile-menu');

        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                var opened = menu.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 4600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                    startHero();
                }
            });
        });

        showSlide(0);
        startHero();

        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';
        var pageSearch = document.querySelector('.page-search');
        var typeFilter = document.querySelector('.type-filter');
        var yearFilter = document.querySelector('.year-filter');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .ranking-item'));

        if (pageSearch && queryValue) {
            pageSearch.value = queryValue;
        }

        function filterCards() {
            var query = normalize(pageSearch ? pageSearch.value : '');
            var type = normalize(typeFilter ? typeFilter.value : '');
            var year = normalize(yearFilter ? yearFilter.value : '');

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
                var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
                card.classList.toggle('is-hidden', !(matchesQuery && matchesType && matchesYear));
            });
        }

        [pageSearch, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        if (cards.length) {
            filterCards();
        }
    });

    window.initMoviePlayer = function (sourceUrl, videoId, playButtonId, overlayId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(playButtonId);
        var overlay = document.getElementById(overlayId);
        var attached = false;
        var hlsInstance = null;

        if (!video) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                attached = true;
                return;
            }

            video.src = sourceUrl;
            attached = true;
        }

        function playVideo() {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (!attached) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    };
})();
