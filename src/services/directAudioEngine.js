// High-Performance Direct Audio Engine & Mobile Background Audio Anchor for Safar FM
// Enables continuous background audio playback on Mobile Browsers (Android Chrome, iOS Safari)
// when switching to apps like WhatsApp or when screen is locked.

const SILENT_WAV_BASE64 = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

class DirectAudioEngine {
  constructor() {
    this.audio = typeof window !== 'undefined' ? new Audio() : null;
    this.silentAnchor = typeof window !== 'undefined' ? new Audio(SILENT_WAV_BASE64) : null;
    this.currentUrl = null;
    this.isPlaying = false;
    this.isAnchorPlaying = false;
    this.onTimeUpdateCallbacks = new Set();
    this.onEndedCallbacks = new Set();
    this.onErrorCallbacks = new Set();

    if (this.silentAnchor) {
      this.silentAnchor.loop = true;
    }

    if (this.audio) {
      this.initListeners();
    }
  }

  initListeners() {
    this.audio.addEventListener('timeupdate', () => {
      const cur = this.audio.currentTime || 0;
      const dur = this.audio.duration && isFinite(this.audio.duration) ? this.audio.duration : 0;
      this.onTimeUpdateCallbacks.forEach((cb) => cb(cur, dur));
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.onEndedCallbacks.forEach((cb) => cb());
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[DirectAudioEngine] Audio stream error:', e);
      this.onErrorCallbacks.forEach((cb) => cb(e));
    });
  }

  // Starts silent audio loop anchor to request Mobile OS Background Audio Wake-Lock
  async startSilentAnchor() {
    if (!this.silentAnchor) return;
    try {
      if (this.silentAnchor.paused) {
        await this.silentAnchor.play();
        this.isAnchorPlaying = true;
        console.log('[DirectAudioEngine] Mobile Background Audio Silent Anchor started');
      }
    } catch (e) {
      console.warn('[DirectAudioEngine] Silent Anchor start warning:', e);
    }
  }

  stopSilentAnchor() {
    if (this.silentAnchor && !this.silentAnchor.paused) {
      this.silentAnchor.pause();
      this.isAnchorPlaying = false;
    }
  }

  async playTrack(url, startTime = 0) {
    if (!this.audio) return false;

    // Start silent anchor first to lock OS background audio permissions
    await this.startSilentAnchor();

    if (this.currentUrl !== url) {
      this.currentUrl = url;
      this.audio.src = url;
      this.audio.load();
    }

    if (startTime > 0 && isFinite(startTime)) {
      try {
        this.audio.currentTime = startTime;
      } catch (e) {}
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      console.log('[DirectAudioEngine] Direct audio track playing:', url);
      return true;
    } catch (err) {
      console.warn('[DirectAudioEngine] Direct audio playback failed:', err);
      this.isPlaying = false;
      return false;
    }
  }

  async resume() {
    if (!this.audio) return false;
    await this.startSilentAnchor();
    try {
      await this.audio.play();
      this.isPlaying = true;
      return true;
    } catch (err) {
      console.warn('[DirectAudioEngine] Resume failed:', err);
      this.isPlaying = false;
      return false;
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  seek(seconds) {
    if (this.audio && isFinite(seconds)) {
      try {
        this.audio.currentTime = seconds;
      } catch (e) {}
    }
  }

  getCurrentTime() {
    return this.audio ? this.audio.currentTime || 0 : 0;
  }

  getDuration() {
    return this.audio && isFinite(this.audio.duration) ? this.audio.duration : 0;
  }

  setVolume(vol) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, vol));
    }
  }

  onTimeUpdate(cb) {
    this.onTimeUpdateCallbacks.add(cb);
    return () => this.onTimeUpdateCallbacks.delete(cb);
  }

  onEnded(cb) {
    this.onEndedCallbacks.add(cb);
    return () => this.onEndedCallbacks.delete(cb);
  }

  onError(cb) {
    this.onErrorCallbacks.add(cb);
    return () => this.onErrorCallbacks.delete(cb);
  }
}

export const directAudioEngine = new DirectAudioEngine();

