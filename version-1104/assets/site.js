(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var current = 0;
      var showSlide = function (index) {
        current = index % slides.length;
        if (current < 0) {
          current = slides.length - 1;
        }
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var keyword = filterRoot.querySelector("[data-filter-keyword]");
      var year = filterRoot.querySelector("[data-filter-year]");
      var region = filterRoot.querySelector("[data-filter-region]");
      var genre = filterRoot.querySelector("[data-filter-genre]");
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-title]"));
      var empty = filterRoot.querySelector("[data-filter-empty]");
      var apply = function () {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var r = region ? region.value : "";
        var g = genre ? genre.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }
          if (r && card.getAttribute("data-region") !== r) {
            ok = false;
          }
          if (g && (card.getAttribute("data-genre") || "").indexOf(g) === -1) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      [keyword, year, region, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    }

    var searchRoot = document.querySelector("[data-search-root]");
    if (searchRoot && Array.isArray(window.SEARCH_MOVIES)) {
      var input = searchRoot.querySelector("[data-search-input]");
      var results = searchRoot.querySelector("[data-search-results]");
      var emptyBox = searchRoot.querySelector("[data-search-empty]");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (input) {
        input.value = initial;
      }
      var render = function () {
        var q = input ? input.value.trim().toLowerCase() : "";
        var pool = window.SEARCH_MOVIES;
        var matched = q
          ? pool.filter(function (item) {
              return [item.title, item.year, item.region, item.genre, item.tags].join(" ").toLowerCase().indexOf(q) !== -1;
            })
          : pool.slice(0, 48);
        matched = matched.slice(0, 120);
        if (results) {
          results.innerHTML = matched.map(function (item) {
            return '<article class="movie-card">' +
              '<a class="movie-poster" href="' + item.href + '">' +
              '<img src="' + item.poster + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">' +
              '<span class="movie-duration">' + item.duration + '</span>' +
              '</a>' +
              '<div class="movie-card-body">' +
              '<div class="movie-tags"><span>' + item.region + '</span><span>' + item.year + '</span></div>' +
              '<h3><a href="' + item.href + '">' + item.title + '</a></h3>' +
              '<p>' + item.oneLine + '</p>' +
              '<div class="movie-meta"><span>' + item.genre + '</span></div>' +
              '</div>' +
              '</article>';
          }).join("");
        }
        if (emptyBox) {
          emptyBox.classList.toggle("is-visible", matched.length === 0);
        }
      };
      if (input) {
        input.addEventListener("input", render);
      }
      render();
    }
  });
})();
