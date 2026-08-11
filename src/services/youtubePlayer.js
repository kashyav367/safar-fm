// Official YouTube IFrame Player API Engine for Safar FM
// Complies with official YouTube embedding guidelines inside responsive bus CRT container

class YouTubePlayerEngine {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.currentVideoId = null;
    this.isEndedGuard = false;
    this.onStateChangeCallbacks = new Set();
    this.onEndedCallbacks = new Set();
    this.onErrorCallbacks = new Set();
    this.onTimeUpdateCallbacks = new Set();
    this.timeUpdateInterval = null;

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        this.loadIFrameAPI();
      } else {
        window.addEventListener('DOMContentLoaded', () => this.loadIFrameAPI());
      }
    }
  }

  loadIFrameAPI() {
    if (typeof window === 'undefined') return;
    if (window.YT && window.YT.Player) {
      this.initPlayerContainer();
      return;
    }

    let tag = document.getElementById('yt-iframe-api-script');
    if (!tag) {
      tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else if (document.head) {
        document.head.appendChild(tag);
      }
    }

    window.onYouTubeIframeAPIReady = () => {
      this.initPlayerContainer();
    };
  }

  initPlayerContainer() {
    if (this.player) return;
    if (typeof document === 'undefined') return;

    const container = document.getElementById('youtube-player-container');
    if (!container) {
      setTimeout(() => this.initPlayerContainer(), 300);
      return;
    }

    try {
      this.player = new window.YT.Player('youtube-player-container', {
        width: '100%',
        height: '100%',
        videoId: this.currentVideoId || 'Xi6BjmipH58',
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 0,
          enablejsapi: 1,
          fs: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          origin: typeof window !== 'undefined' ? window.location.origin : ''
        },
        events: {
          onReady: (event) => {
            console.log('[YouTubeEngine] Player Container Mounted & Ready');
            this.isReady = true;
            try {
              if (typeof this.player.unMute === 'function') this.player.unMute();
              if (typeof this.player.setVolume === 'function') this.player.setVolume(100);
              if (!this.currentVideoId && typeof this.player.pauseVideo === 'function') {
                this.player.pauseVideo();
              }
            } catch (e) {}
            this.startTimeTracking();
          },
          onStateChange: (event) => {
            // YT.PlayerState: PLAYING (1), PAUSED (2), ENDED (0), BUFFERING (3)
            this.onStateChangeCallbacks.forEach((cb) => cb(event.data));

            if (event.data === 1) {
              this.isEndedGuard = false;
            }

            if (event.data === 0 && !this.isEndedGuard) {
              this.isEndedGuard = true;
              console.log('[YouTubeEngine] YT.PlayerState.ENDED (0) triggered auto-advance');
              this.onEndedCallbacks.forEach((cb) => cb());
            }
          },
          onError: (event) => {
            console.error('[YouTubeEngine] Playback Error Code:', event.data);
            this.onErrorCallbacks.forEach((cb) => cb(event.data));
            if (!this.isEndedGuard) {
              this.isEndedGuard = true;
              setTimeout(() => {
                this.onEndedCallbacks.forEach((cb) => cb());
              }, 1000);
            }
          }
        }
      });
    } catch (e) {
      console.error('[YouTubeEngine] Init Exception:', e);
    }
  }

  loadVideo(videoId, playImmediately = true) {
    if (!videoId) return false;
    this.currentVideoId = videoId;
    this.isEndedGuard = false;

    if (!this.player || !this.isReady) {
      setTimeout(() => this.loadVideo(videoId, playImmediately), 400);
      return false;
    }

    try {
      if (playImmediately) {
        this.player.loadVideoById({ videoId: videoId });
        if (typeof this.player.unMute === 'function') this.player.unMute();
        if (typeof this.player.setVolume === 'function') this.player.setVolume(100);
        if (typeof this.player.playVideo === 'function') this.player.playVideo();
      } else {
        this.player.cueVideoById({ videoId: videoId });
      }
      return true;
    } catch (e) {
      console.error('[YouTubeEngine] loadVideo error:', e);
      return false;
    }
  }

  play() {
    if (this.player && this.isReady && typeof this.player.playVideo === 'function') {
      try {
        if (typeof this.player.unMute === 'function') this.player.unMute();
        if (typeof this.player.setVolume === 'function') this.player.setVolume(100);
        this.player.playVideo();
      } catch (e) {}
    }
  }

  pause() {
    if (this.player && this.isReady && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch (e) {}
    }
  }

  seekTo(seconds) {
    if (this.player && this.isReady && typeof this.player.seekTo === 'function') {
      try {
        this.player.seekTo(seconds, true);
      } catch (e) {}
    }
  }

  getCurrentTime() {
    if (this.player && this.isReady && typeof this.player.getCurrentTime === 'function') {
      try {
        return this.player.getCurrentTime() || 0;
      } catch (e) {}
    }
    return 0;
  }

  getDuration() {
    if (this.player && this.isReady && typeof this.player.getDuration === 'function') {
      try {
        return this.player.getDuration() || 0;
      } catch (e) {}
    }
    return 0;
  }

  setVolume(volumePercent) {
    if (this.player && this.isReady && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(volumePercent);
      } catch (e) {}
    }
  }

  startTimeTracking() {
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
    this.timeUpdateInterval = setInterval(() => {
      const cur = this.getCurrentTime();
      const dur = this.getDuration();
      if (cur > 0 || dur > 0) {
        this.onTimeUpdateCallbacks.forEach((cb) => cb(cur, dur));
      }
    }, 500);
  }

  destroy() {
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch (e) {}
      this.player = null;
    }
  }

  onStateChange(cb) {
    this.onStateChangeCallbacks.add(cb);
    return () => this.onStateChangeCallbacks.delete(cb);
  }

  onEnded(cb) {
    this.onEndedCallbacks.add(cb);
    return () => this.onEndedCallbacks.delete(cb);
  }

  onTimeUpdate(cb) {
    this.onTimeUpdateCallbacks.add(cb);
    return () => this.onTimeUpdateCallbacks.delete(cb);
  }

  onError(cb) {
    this.onErrorCallbacks.add(cb);
    return () => this.onErrorCallbacks.delete(cb);
  }
}

export const youtubePlayer = new YouTubePlayerEngine();
