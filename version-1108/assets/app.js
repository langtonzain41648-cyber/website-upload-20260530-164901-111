(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var url = "./search.html";
                if (query) {
                    url += "?q=" + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero-slider]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                play();
            });
        });
        show(0);
        play();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var searchInput = scope.querySelector("[data-search-input]");
            var typeSelect = scope.querySelector("[data-filter-type]");
            var regionSelect = scope.querySelector("[data-filter-region]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var emptyState = scope.querySelector("[data-empty-state]");
            var grid = scope.querySelector(".catalog-grid");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

            function apply() {
                var query = normalize(searchInput && searchInput.value);
                var type = normalize(typeSelect && typeSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.tags
                    ].join(" "));
                    var matched = true;
                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (type && normalize(card.dataset.type) !== type) {
                        matched = false;
                    }
                    if (region && normalize(card.dataset.region) !== region) {
                        matched = false;
                    }
                    if (year && normalize(card.dataset.year) !== year) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.classList.toggle("show", visible === 0);
                }
            }

            function sortCards(mode) {
                if (!grid) {
                    return;
                }
                var sorted = cards.slice().sort(function (a, b) {
                    if (mode === "title") {
                        return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
                    }
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                cards = sorted;
                apply();
            }

            [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            scope.querySelectorAll("[data-sort]").forEach(function (button) {
                button.addEventListener("click", function () {
                    sortCards(button.dataset.sort);
                });
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && searchInput) {
                searchInput.value = q;
            }
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var stream = player.getAttribute("data-stream");
            var attached = false;

            if (!video || !stream) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else {
                    video.src = stream;
                }
            }

            function start() {
                attach();
                player.classList.add("is-started");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-started");
            });
        });
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initPlayers();
    });
}());
