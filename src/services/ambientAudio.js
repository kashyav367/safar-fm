// Web Audio API Synthesizer for Nostalgic Bus Journey Sounds & Radio Melody
class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    
    // Nodes
    this.engineGain = null;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    
    this.rainGain = null;
    this.rainNoiseNode = null;
    
    this.windGain = null;
    this.windNoiseNode = null;
    this.melodyInterval = null;
  }

  init() {
    if (this.isInitialized) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    
    this.ctx = new AudioCtx();
    this.isInitialized = true;
    
    // Master Ambient Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    
    // 1. Engine Hum Generator (Low frequency diesel rumble)
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(45, this.ctx.currentTime); // Low engine idle Hz
    
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.setValueAtTime(90, this.ctx.currentTime);
    
    const engineFilter = this.ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    
    this.engineOsc1.connect(engineFilter);
    this.engineOsc2.connect(engineFilter);
    engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);
    
    this.engineOsc1.start();
    this.engineOsc2.start();
    
    // 2. Rain & Roof Drops Noise Generator
    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this.rainNoiseNode = this.ctx.createBufferSource();
    this.rainNoiseNode.buffer = noiseBuffer;
    this.rainNoiseNode.loop = true;
    
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    rainFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);
    
    this.rainNoiseNode.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    this.rainNoiseNode.start();
  }

  ensureContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEngineVolume(val) {
    this.ensureContext();
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(val * 0.4, this.ctx.currentTime, 0.1);
    }
  }

  setRainVolume(val) {
    this.ensureContext();
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(val * 0.3, this.ctx.currentTime, 0.1);
    }
  }

  playHorn() {
    this.ensureContext();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const hornGain = this.ctx.createGain();
    hornGain.gain.setValueAtTime(0.3, now);
    hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    
    // Classic dual-tone vintage roadways bus horn (F# and A chord)
    osc1.frequency.setValueAtTime(370, now);
    osc2.frequency.setValueAtTime(440, now);
    
    osc1.connect(hornGain);
    osc2.connect(hornGain);
    hornGain.connect(this.masterGain);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.9);
    osc2.stop(now + 0.9);
  }

  playRadioStatic(durationSec = 0.4) {
    this.ensureContext();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const staticGain = this.ctx.createGain();
    staticGain.gain.setValueAtTime(0.2, now);
    staticGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
    
    const bufferSize = this.ctx.sampleRate * durationSec;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, now);
    
    noise.connect(filter);
    filter.connect(staticGain);
    staticGain.connect(this.masterGain);
    
    noise.start(now);
  }

  startRadioMelody() {
    this.ensureContext();
    if (!this.ctx || this.melodyInterval) return;

    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00]; // Indian Raag Pahadi scale
    let step = 0;

    this.melodyInterval = setInterval(() => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const freq = notes[step % notes.length];
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.45);

      step++;
    }, 450);
  }

  stopRadioMelody() {
    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
  }
}

export const ambientAudio = new AmbientAudioEngine();
