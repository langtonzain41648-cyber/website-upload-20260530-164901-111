(function () {
  function scriptFromUrl(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  var hlsPromise = null;

  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsPromise) {
      hlsPromise = import('./assets/hls.js')
        .then(function (module) {
          return module.H || module.default || window.Hls || null;
        })
        .catch(function () {
          return scriptFromUrl('https://cdn.jsdelivr.net/npm/hls.js@1')
            .then(function () {
              return window.Hls || null;
            })
            .catch(function () {
              return null;
            });
        });
    }
    return hlsPromise;
  }

  window.initMoviePlayer = function (videoId, overlayId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !url) {
      return;
    }

    var attached = false;
    var pending = null;

    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      if (pending) {
        return pending;
      }
      pending = new Promise(function (resolve) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          attached = true;
          resolve();
          return;
        }
        getHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            video._hls = hls;
            attached = true;
            resolve();
          } else {
            video.src = url;
            attached = true;
            resolve();
          }
        });
      });
      return pending;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function play() {
      attach().then(function () {
        hideOverlay();
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      });
    }

    attach();
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('play', hideOverlay);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
