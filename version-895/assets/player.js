
function startMoviePlayer(videoId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hlsInstance = null;
    var started = false;

    if (!video || !cover || !streamUrl) {
        return;
    }

    function hideCover() {
        cover.classList.add("hidden");
    }

    function playVideo() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                video.muted = true;
                video.play().catch(function () {});
            });
        }
    }

    function attachStream() {
        if (started) {
            hideCover();
            playVideo();
            return;
        }

        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            hideCover();
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                hideCover();
                playVideo();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal && hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.src = streamUrl;
                    hideCover();
                    playVideo();
                }
            });
            return;
        }

        video.src = streamUrl;
        hideCover();
        playVideo();
    }

    cover.addEventListener("click", attachStream);
    video.addEventListener("click", function () {
        if (!started) {
            attachStream();
        }
    });
}
