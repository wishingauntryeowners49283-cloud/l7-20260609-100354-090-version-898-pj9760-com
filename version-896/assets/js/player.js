(function () {
  function initMoviePlayer(source, rootId) {
    var root = document.getElementById(rootId || "movie-player");

    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var errorBox = root.querySelector(".player-error");
    var attached = false;
    var hlsInstance = null;

    function showError() {
      root.classList.add("has-error");

      if (errorBox) {
        errorBox.textContent = "播放暂不可用，请稍后再试";
      }
    }

    function attachSource() {
      if (!video || attached) {
        return true;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return true;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
        return true;
      }

      showError();
      return false;
    }

    function playMovie() {
      if (!attachSource()) {
        return;
      }

      root.classList.add("is-playing");
      video.controls = true;

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          root.classList.remove("is-playing");
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", playMovie);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playMovie();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        root.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          root.classList.remove("is-playing");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
