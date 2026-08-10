import React from 'react';
import { Radio } from 'lucide-react';

export default function BackgroundView({ isPlaying, currentTrack }) {
  const bgImage = '/assets/safar_bus_interior_tv.png';

  return (
    <div className="fixed inset-0 z-0 overflow-hidden select-none bg-black">
      {/* Off-screen YouTube Player Container for seamless audio streaming */}
      <div 
        id="youtube-player-container" 
        className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none -z-50 overflow-hidden" 
        aria-hidden="true"
      ></div>

      {/* Full-Screen Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out transform scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Subtle Gradient Overlay for visual hierarchy */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>
        <div className="absolute inset-0 bg-radial-vignette opacity-50 pointer-events-none"></div>
      </div>

      {/* Centered Vintage Title */}
      <div className="absolute top-[12vh] sm:top-[14vh] inset-x-0 z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-md mb-2 drop-shadow-md">
          <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>Safar FM • 92.7 MHz</span>
        </div>

        <h1 className="font-devanagari text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-extrabold tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] leading-tight">
          सफ़र यात्री परिवहन
        </h1>

        <p className="font-retro-sub text-lg sm:text-2xl md:text-3xl text-amber-200/90 mt-1 sm:mt-2 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
          90s के सदाबहार नगमे • बस ड्राइवर की पसंद
        </p>
      </div>

      {/* Retro CRT Scanlines filter */}
      <div className="absolute inset-0 crt-overlay opacity-20 pointer-events-none"></div>
    </div>
  );
}
