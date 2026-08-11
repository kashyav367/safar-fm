// High-Performance Direct Audio Engine & Mobile Background Audio Anchor for Safar FM
// Enables continuous background audio playback on Mobile Browsers (Android Chrome, iOS Safari)
// when switching to apps like WhatsApp or when screen is locked.

const SILENT_WAV_BASE64 = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

// Converts archive.org direct node IPs to high-availability CDN download URLs
function normalizeAudioUrl(url) {
  if (!url) return url;
  if (url.includes('ia800300.us.archive.org/1/items/')) {
    return url.replace('https://ia800300.us.archive.org/1/items/', 'https://archive.org/download/');
  }
  if (url.includes('archive.org/items/')) {
    return url.replace('archive.org/items/', 'archive.org/download/');
  }
  return url;
}

class DirectAudioEngine {
  constructor() {
    this.audio = null;
    this.silentAnchor = null;
    this.currentUrl = null;
    this.isPlaying = false;
    this.isAnchorPlaying = false;
    this.onTimeUpdateCallbacks = new Set();
    this.onEndedCallbacks = new Set();
    this.onErrorCallbacks = new Set();

    if (typeof window !== 'undefined') {
      this.initDomNodes();
    }
  }

  initDomNodes() {
    if (typeof document === 'undefined') return;

    // 1. Primary Direct Audio DOM Node (Attached to document.body so Android Chrome won't GC it)
    let existingAudio = document.getElementById('safar-direct-audio');
    if (!existingAudio) {
      existingAudio = document.createElement('audio');
      existingAudio.id = 'safar-direct-audio';
      existingAudio.setAttribute('preload', 'auto');
      existingAudio.setAttribute('playsinline', 'true');
      existingAudio.setAttribute('webkit-playsinline', 'true');
      existingAudio.setAttribute('crossorigin', 'anonymous');
      existingAudio.style.display = 'none';
      document.body.appendChild(existingAudio);
    }
    this.audio = existingAudio;

    // 2. Mobile Silent Anchor Loop DOM Node
    let existingAnchor = document.getElementById('safar-silent-anchor');
    if (!existingAnchor) {
      existingAnchor = document.createElement('audio');
      existingAnchor.id = 'safar-silent-anchor';
      existingAnchor.setAttribute('preload', 'auto');
      existingAnchor.setAttribute('playsinline', 'true');
      existingAnchor.setAttribute('webkit-playsinline', 'true');
      existingAnchor.loop = true;
      existingAnchor.src = SILENT_WAV_BASE64;
      existingAnchor.style.display = 'none';
      document.body.appendChild(existingAnchor);
    }
    this.silentAnchor = existingAnchor;

    this.initListeners();
  }

  initListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('timeupdate', () => {
      const cur = this.audio.currentTime || 0;
      const dur = this.audio.duration && isFinite(this.audio.duration) ? this.audio.duration : 0;
      this.updateMediaSessionPosition(cur, dur);
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

  updateMediaSessionPosition(cur, dur) {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        if (dur > 0 && cur >= 0 && cur <= dur) {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: this.audio ? this.audio.playbackRate || 1 : 1,
            position: cur
          });
        }
      } catch (e) {}
    }
  }

  // Starts silent audio loop anchor to request Mobile OS Background Audio Wake-Lock
  async startSilentAnchor() {
    if (!this.silentAnchor) return;
    try {
      if (this.silentAnchor.paused) {
        await this.silentAnchor.play();
        this.isAnchorPlaying = true;
        console.log('[DirectAudioEngine] Mobile Background Audio Silent Anchor started in DOM');
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
    if (!this.audio) {
      this.initDomNodes();
    }
    if (!this.audio) return false;

    const normalizedUrl = normalizeAudioUrl(url);

    // Start silent anchor first to lock OS background audio permissions
    await this.startSilentAnchor();

    if (this.currentUrl !== normalizedUrl) {
      this.currentUrl = normalizedUrl;
      this.audio.src = normalizedUrl;
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
      console.log('[DirectAudioEngine] Direct audio track playing:', normalizedUrl);
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


