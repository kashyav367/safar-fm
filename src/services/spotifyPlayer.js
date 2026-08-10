// Official Spotify Web Playback SDK Engine for Safar FM
// Connects Spotify OAuth token & streams audio directly via Spotify Web Playback SDK

class SpotifyPlayerEngine {
  constructor() {
    this.player = null;
    this.deviceId = null;
    this.token = localStorage.getItem('safar_spotify_token') || null;
    this.isReady = false;
    this.isConnected = false;
    this.currentUri = null;
    this.isTransferred = false;
    this.lastState = null;
    this.onStateChangeCallbacks = new Set();
    this.onEndedCallbacks = new Set();
    this.onReadyCallbacks = new Set();

    if (typeof window !== 'undefined') {
      this.loadSDK();
    }
  }

  loadSDK() {
    if (window.Spotify) {
      this.initPlayer();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (this.token) {
        this.initPlayer();
      }
    };
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('safar_spotify_token', token);
    this.initPlayer();
  }

  initPlayer() {
    if (!this.token || !window.Spotify) return;
    if (this.player) return;

    this.player = new window.Spotify.Player({
      name: 'Safar FM • Highway Bus Player',
      getOAuthToken: (cb) => cb(this.token),
      volume: 0.8
    });

    // Error handling
    this.player.addListener('initialization_error', ({ message }) => {
      console.error('[SpotifyEngine] Initialization Error:', message);
    });
    this.player.addListener('authentication_error', ({ message }) => {
      console.error('[SpotifyEngine] Authentication Error (Token Expired or Invalid):', message);
      this.handleTokenExpiry();
    });
    this.player.addListener('account_error', ({ message }) => {
      console.error('[SpotifyEngine] Account Error (Requires Spotify Premium):', message);
    });

    // Ready
    this.player.addListener('ready', async ({ device_id }) => {
      console.log('[SpotifyEngine] Ready with Device ID:', device_id);
      this.deviceId = device_id;
      this.isReady = true;
      this.isConnected = true;
      this.onReadyCallbacks.forEach((cb) => cb(device_id));
      await this.transferPlayback();
    });

    this.player.addListener('not_ready', ({ device_id }) => {
      console.log('[SpotifyEngine] Device ID offline:', device_id);
      this.isReady = false;
    });

    this.player.addListener('player_state_changed', (state) => {
      if (!state) return;
      console.log('[SpotifyEngine] Player State Changed:', {
        paused: state.paused,
        position: state.position,
        duration: state.duration,
        track: state.track_window?.current_track?.name
      });

      // Track finish detection (position 0 and paused right after playing)
      if (
        this.lastState &&
        !this.lastState.paused &&
        state.paused &&
        state.position === 0
      ) {
        console.log('[SpotifyEngine] Track completed automatically, advancing...');
        this.onEndedCallbacks.forEach((cb) => cb());
      }

      this.lastState = state;
      this.onStateChangeCallbacks.forEach((cb) => cb(state));
    });

    this.player.connect();
  }

  isValidSpotifyUri(uri) {
    return typeof uri === 'string' && /^spotify:track:[a-zA-Z0-9]{22}$/.test(uri.trim());
  }

  async transferPlayback() {
    if (!this.token || !this.deviceId) return false;

    try {
      const res = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          device_ids: [this.deviceId],
          play: false
        })
      });

      if (res.status === 401) {
        this.handleTokenExpiry();
        return false;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[SpotifyEngine] Transfer Playback Failed. Status: ${res.status}, Response: ${errorText}`);
        return false;
      }

      console.log('[SpotifyEngine] Playback transferred successfully to Safar FM Web SDK Device');
      this.isTransferred = true;
      return true;
    } catch (e) {
      console.error('[SpotifyEngine] Transfer Playback Exception:', e);
      return false;
    }
  }

  async playUri(spotifyUri, playlistInfo = {}) {
    if (!this.isValidSpotifyUri(spotifyUri)) {
      console.error(`[SpotifyEngine] Invalid Spotify Track URI: "${spotifyUri}". Must match "spotify:track:22chars"`);
      return false;
    }

    if (!this.token || !this.deviceId) {
      console.warn('[SpotifyEngine] Missing Spotify Token or Device ID. Cannot stream via Web SDK.');
      return false;
    }

    this.currentUri = spotifyUri;

    console.log('[SpotifyEngine] Playing Track via Spotify Web SDK API:', {
      playlist: playlistInfo.playlistId || 'unknown',
      currentIndex: playlistInfo.currentIndex ?? 'unknown',
      currentTrackUri: spotifyUri,
      nextTrackUri: playlistInfo.nextTrackUri || 'none',
      deviceId: this.deviceId
    });

    try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ uris: [spotifyUri] })
      });

      if (res.status === 401) {
        console.error('[SpotifyEngine] Spotify Token Expired (401 Unauthorized)');
        this.handleTokenExpiry();
        return false;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[SpotifyEngine] Spotify API Error Status: ${res.status}, Response: ${errorText}`);
        return false;
      }

      console.log(`[SpotifyEngine] Spotify API Status: ${res.status} OK`);
      return true;
    } catch (e) {
      console.error('[SpotifyEngine] Play URI Exception:', e);
      return false;
    }
  }

  async play() {
    if (this.player) {
      try {
        await this.player.resume();
      } catch (e) {
        console.error('[SpotifyEngine] Resume Exception:', e);
      }
    }
  }

  async pause() {
    if (this.player) {
      try {
        await this.player.pause();
      } catch (e) {
        console.error('[SpotifyEngine] Pause Exception:', e);
      }
    }
  }

  async seek(positionMs) {
    if (this.player) {
      try {
        await this.player.seek(positionMs);
      } catch (e) {
        console.error('[SpotifyEngine] Seek Exception:', e);
      }
    }
  }

  handleTokenExpiry() {
    this.token = null;
    this.isConnected = false;
    this.isReady = false;
    this.deviceId = null;
    localStorage.removeItem('safar_spotify_token');
    if (typeof window !== 'undefined') {
      console.warn('[SpotifyEngine] Spotify token disconnected due to auth expiry.');
    }
  }

  disconnect() {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
    this.handleTokenExpiry();
  }

  onStateChange(cb) {
    this.onStateChangeCallbacks.add(cb);
    return () => this.onStateChangeCallbacks.delete(cb);
  }

  onEnded(cb) {
    this.onEndedCallbacks.add(cb);
    return () => this.onEndedCallbacks.delete(cb);
  }

  onReady(cb) {
    this.onReadyCallbacks.add(cb);
    return () => this.onReadyCallbacks.delete(cb);
  }
}

export const spotifyPlayer = new SpotifyPlayerEngine();
