(() => {
  const players = document.querySelectorAll('.js-player');

  players.forEach((player) => {
    const video = player.querySelector('video');
    const cover = player.querySelector('.player-cover');

    if (!video || !cover) {
      return;
    }

    const source = video.getAttribute('src');

    if (source && window.Hls && window.Hls.isSupported()) {
      video.removeAttribute('src');
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }

    const begin = () => {
      cover.classList.add('is-hidden');
      const action = video.play();

      if (action && typeof action.catch === 'function') {
        action.catch(() => {
          cover.classList.remove('is-hidden');
        });
      }
    };

    cover.addEventListener('click', begin);

    video.addEventListener('click', () => {
      if (video.paused) {
        begin();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      cover.classList.add('is-hidden');
    });

    video.addEventListener('pause', () => {
      if (!video.ended) {
        cover.classList.remove('is-hidden');
      }
    });

    video.addEventListener('ended', () => {
      cover.classList.remove('is-hidden');
    });
  });
})();
