var MoviePlayer = (function () {
    var hlsInstance = null;

    function init(streamUrl) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.getElementById('playerOverlay');

        if (!video || !overlay || !streamUrl) {
            return;
        }

        var attached = false;

        function attachStream() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function beginPlayback() {
            attachStream();
            overlay.classList.add('is-hidden');
            video.controls = true;

            var playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === 'function') {
                playAttempt.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', beginPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                beginPlayback();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    return {
        init: init
    };
})();
