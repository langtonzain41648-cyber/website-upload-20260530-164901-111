(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', () => {
      mainNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timer = null;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const start = () => {
      timer = window.setInterval(() => {
        showSlide(activeIndex + 1);
      }, 5000);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        restart();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterList = document.querySelector('[data-filter-list]');
  const resultCount = document.querySelector('[data-result-count]');

  if (filterInput && filterList) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (filterInput.hasAttribute('data-query-source') && query) {
      filterInput.value = query;
    }

    const items = Array.from(filterList.querySelectorAll('.searchable-item'));

    const applyFilter = () => {
      const value = filterInput.value.trim().toLowerCase();
      let visible = 0;

      items.forEach((item) => {
        const haystack = [
          item.dataset.title,
          item.dataset.genre,
          item.dataset.region,
          item.dataset.tags,
          item.textContent
        ].join(' ').toLowerCase();
        const matched = !value || haystack.includes(value);
        item.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = `筛选结果 ${visible}`;
      }
    };

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }
})();
