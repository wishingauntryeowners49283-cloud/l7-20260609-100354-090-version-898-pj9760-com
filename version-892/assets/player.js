(function () {
    var configElement = document.getElementById('player-config');
    var video = document.querySelector('[data-player-video]');
    var startButtons = Array.prototype.slice.call(document.querySelectorAll('[data-player-start]'));
    var layer = document.querySelector('.player-layer');

    if (!configElement || !video) {
        return;
    }

    var config = {};

    try {
        config = JSON.parse(configElement.textContent || '{}');
    } catch (error) {
        config = {};
    }

    var attached = false;

    function attachStream() {
        if (attached || !config.url) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.url;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(config.url);
            hls.attachMedia(video);
            return;
        }

        video.src = config.url;
    }

    function start() {
        attachStream();
        video.controls = true;

        if (layer) {
            layer.classList.add('is-hidden');
        }

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                video.controls = true;
            });
        }
    }

    startButtons.forEach(function (button) {
        button.addEventListener('click', start);
    });

    video.addEventListener('click', function () {
        if (!attached || video.paused) {
            start();
        }
    });
})();
