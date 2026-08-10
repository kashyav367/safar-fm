import React, { useState } from 'react';
import { Volume2, CloudRain, Radio, Sliders, X, Sparkles } from 'lucide-react';
import { ambientAudio } from '../services/ambientAudio';

export default function AmbientSoundDeck({ isOpen, onClose }) {
  const [engineVol, setEngineVol] = useState(0);
  const [rainVol, setRainVol] = useState(0);

  if (!isOpen) return null;

  const handleEngineChange = (val) => {
    setEngineVol(val);
    ambientAudio.setEngineVolume(val);
  };

  const handleRainChange = (val) => {
    setRainVol(val);
    ambientAudio.setRainVolume(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="saloon-glass w-full max-w-md rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Bus Soundscape Synthesizer</h2>
              <p className="text-xs text-white/60">Mix ambient engine hum & rain drops</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Controls */}
        <div className="space-y-4">
          {/* Engine Hum */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Tata Diesel Bus Engine Hum
              </span>
              <span className="text-xs font-mono text-amber-300">{Math.round(engineVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={engineVol}
              onChange={(e) => handleEngineChange(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>

          {/* Rain on Roof */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                Raindrops on Tin Roof & Window
              </span>
              <span className="text-xs font-mono text-cyan-300">{Math.round(rainVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={rainVol}
              onChange={(e) => handleRainChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>

          {/* Action Sound SFX Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => ambientAudio.playHorn()}
              className="saloon-glass-pill p-3 rounded-2xl text-xs font-bold text-amber-300 hover:bg-amber-500/20 border border-amber-400/40 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Blow Bus Horn 🎺
            </button>

            <button
              onClick={() => ambientAudio.playRadioStatic(0.5)}
              className="saloon-glass-pill p-3 rounded-2xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 border border-cyan-400/40 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4" />
              Radio Static Squeak 📻
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
