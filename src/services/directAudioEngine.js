// High-Performance Direct Audio Engine for Safar FM
// Plays high-quality direct MP3 streams smoothly without embed blocks

class DirectAudioEngine {
  constructor() {
    this.audio = typeof window !== 'undefined' ? new Audio() : null;
    this.currentUrl = null;
    this.isPlaying = false;
    this.onTimeUpdateCallbacks = new Set();
    this.onEndedCallbacks = new Set();
    this.onErrorCallbacks = new Set();

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
      console.warn('Audio stream playback error, falling back:', e);
      this.onErrorCallbacks.forEach((cb) => cb(e));
    });
  }

  async playTrack(url) {
    if (!this.audio) return false;

    if (this.currentUrl !== url) {
      this.currentUrl = url;
      this.audio.src = url;
      this.audio.load();
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      return true;
    } catch (err) {
      console.warn('Autoplay audio blocked or error:', err);
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
      this.audio.currentTime = seconds;
    }
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
