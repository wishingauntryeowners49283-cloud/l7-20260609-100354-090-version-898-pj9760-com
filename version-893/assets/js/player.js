(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) {
      value = 0;
    }
    var minutes = Math.floor(value / 60);
    var seconds = Math.floor(value % 60);
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var streamUrl = player.getAttribute("data-stream");
    var overlay = player.querySelector("[data-player-overlay]");
    var playButton = player.querySelector("[data-player-play]");
    var muteButton = player.querySelector("[data-player-mute]");
    var fullButton = player.querySelector("[data-player-fullscreen]");
    var progress = player.querySelector("[data-player-progress]");
    var time = player.querySelector("[data-player-time]");
    var hls = null;
    var loaded = false;

    if (!video || !streamUrl) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      loadStream();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function togglePlay() {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    }

    function updatePlayButton() {
      if (playButton) {
        playButton.textContent = video.paused ? "▶" : "❚❚";
      }
      if (overlay && !video.paused) {
        overlay.classList.add("is-hidden");
      }
    }

    function updateProgress() {
      var duration = video.duration || 0;
      var current = video.currentTime || 0;
      if (progress) {
        progress.value = duration ? String((current / duration) * 100) : "0";
      }
      if (time) {
        time.textContent = formatTime(current) + " / " + formatTime(duration);
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (playButton) {
      playButton.addEventListener("click", togglePlay);
    }
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", updatePlayButton);
    video.addEventListener("pause", updatePlayButton);
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("durationchange", updateProgress);
    video.addEventListener("loadedmetadata", updateProgress);
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
      updatePlayButton();
    });

    if (progress) {
      progress.addEventListener("input", function () {
        var duration = video.duration || 0;
        if (duration) {
          video.currentTime = (parseFloat(progress.value) / 100) * duration;
        }
      });
    }

    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "🔇" : "🔊";
      });
    }

    if (fullButton) {
      fullButton.addEventListener("click", function () {
        var target = video.requestFullscreen ? video : player;
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (target.requestFullscreen) {
          target.requestFullscreen();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
    updatePlayButton();
    updateProgress();
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
