function getRootPath() {
  return document.body.dataset.root || "";
}

function initMobileMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav-list]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", () => {
    nav.classList.toggle("is-open");
    button.textContent = nav.classList.contains("is-open") ? "×" : "☰";
  });
}

function initSearchForms() {
  const forms = document.querySelectorAll("[data-search-form]");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";

      if (!query) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });
}

function initHero() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = [...hero.querySelectorAll("[data-hero-slide]")];
  const dots = [...hero.querySelectorAll("[data-hero-dot]")];
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => show(current + 1), 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function renderSearchCard(item, rootPath) {
  const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3).join(" / ") : item.genre;

  return `
    <article class="movie-card">
      <a class="poster-link" href="${rootPath}${item.link}" aria-label="观看 ${escapeHtml(item.title)}">
        <span class="poster-frame">
          <img src="${rootPath}${item.image}" alt="${escapeHtml(item.title)} 海报" loading="lazy">
          <span class="poster-mask">
            <span class="play-icon" aria-hidden="true"></span>
          </span>
          <span class="badge badge-dark">${escapeHtml(item.year)}</span>
          <span class="badge badge-gold">电影</span>
        </span>
      </a>
      <div class="movie-card-body">
        <a class="movie-title" href="${rootPath}${item.link}">${escapeHtml(item.title)}</a>
        <p class="movie-desc">${escapeHtml(item.oneLine || "")}</p>
        <div class="movie-meta">
          <span>${escapeHtml(item.region || "")}</span>
          <span>${escapeHtml(item.genre || "")}</span>
        </div>
        <p class="tag-line">${escapeHtml(tags || "")}</p>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function initSearchPage() {
  const resultBox = document.querySelector("#search-results");
  const summary = document.querySelector("#search-summary");

  if (!resultBox || !summary) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  const pageInput = document.querySelector("#search-page-input");
  const rootPath = getRootPath();

  if (pageInput) {
    pageInput.value = query;
  }

  if (!query) {
    summary.textContent = "请输入关键词开始搜索。";
    return;
  }

  summary.textContent = `正在搜索“${query}”...`;

  try {
    const response = await fetch(`${rootPath}assets/search-data.json`);
    const data = await response.json();
    const normalized = query.toLowerCase();
    const results = data.filter((item) => {
      const haystack = [
        item.title,
        item.year,
        item.region,
        item.genre,
        item.oneLine,
        ...(item.tags || []),
      ].join(" ").toLowerCase();

      return haystack.includes(normalized);
    });

    const visibleResults = results.slice(0, 120);
    summary.textContent = `关键词“${query}”找到 ${results.length} 个相关影片。`;
    resultBox.innerHTML = visibleResults
      .map((item) => renderSearchCard(item, rootPath))
      .join("");

    if (!visibleResults.length) {
      resultBox.innerHTML = "";
    }
  } catch (error) {
    summary.textContent = "搜索数据加载失败，请返回分类页继续浏览。";
  }
}

async function initPlayers() {
  const players = [...document.querySelectorAll("[data-player]")];

  if (!players.length) {
    return;
  }

  players.forEach((player) => {
    setupPlayer(player);
  });
}

async function setupPlayer(player) {
  const source = player.dataset.src;
  const video = player.querySelector("video");
  const cover = player.querySelector(".player-cover");
  const status = player.querySelector("[data-player-status]");
  let initialized = false;
  let hlsInstance = null;

  if (!source || !video || !cover) {
    if (status) {
      status.textContent = "播放源暂不可用。";
    }
    return;
  }

  async function loadSource() {
    if (initialized) {
      return;
    }

    if (status) {
      status.textContent = "正在加载播放源...";
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      const module = await import("./hls.esm.js");
      const Hls = module.H;

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    initialized = true;
  }

  async function startPlayback() {
    try {
      await loadSource();
      cover.hidden = true;
      video.controls = true;
      await video.play();

      if (status) {
        status.textContent = "正在播放";
      }
    } catch (error) {
      cover.hidden = false;

      if (status) {
        status.textContent = "浏览器阻止自动播放，请再次点击播放。";
      }
    }
  }

  cover.addEventListener("click", startPlayback);
  video.addEventListener("play", () => {
    cover.hidden = true;
    if (status) {
      status.textContent = "正在播放";
    }
  });
  video.addEventListener("pause", () => {
    if (status) {
      status.textContent = "已暂停";
    }
  });
  video.addEventListener("error", () => {
    if (status) {
      status.textContent = "播放加载遇到问题，请稍后重试。";
    }
  });
  window.addEventListener("beforeunload", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

function initPlayerJump() {
  const jumpLinks = document.querySelectorAll("[data-player-jump]");

  jumpLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const player = document.querySelector("[data-player]");

      if (player) {
        player.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
}

initMobileMenu();
initSearchForms();
initHero();
initSearchPage();
initPlayers();
initPlayerJump();
