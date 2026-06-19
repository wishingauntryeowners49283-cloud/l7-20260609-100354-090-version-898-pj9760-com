(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function attach(card) {
        var video = card.querySelector("video");
        var play = card.querySelector(".poster-play");
        var source = card.getAttribute("data-video-url");
        var hls = null;
        var attached = false;

        if (!video || !play || !source) {
            return;
        }

        function bindSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            bindSource();
            play.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        play.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(attach);
    });
})();
