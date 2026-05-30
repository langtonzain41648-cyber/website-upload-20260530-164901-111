(function () {
  function bindPlayer(panel) {
    var video = panel.querySelector('video');
    var button = panel.querySelector('[data-play-button]');
    var overlay = panel.querySelector('[data-player-overlay]');
    var status = panel.querySelector('[data-player-status]');
    var source = panel.getAttribute('data-source');
    var hls = null;
    var loaded = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function loadSource() {
      if (loaded) {
        return Promise.resolve();
      }

      loaded = true;
      setStatus('正在加载');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus('视频加载失败');
            panel.classList.add('is-error');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('');
        }, { once: true });
      } else {
        setStatus('当前浏览器暂不支持播放');
        panel.classList.add('is-error');
        return Promise.reject(new Error('unsupported'));
      }

      return new Promise(function (resolve) {
        video.addEventListener('canplay', resolve, { once: true });
        window.setTimeout(resolve, 900);
      });
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      loadSource().then(function () {
        return video.play();
      }).then(function () {
        panel.classList.add('is-playing');
        setStatus('');
      }).catch(function () {
        setStatus('点击视频区域可继续播放');
      });
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      panel.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      panel.classList.remove('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(bindPlayer);
})();
