import React, { memo } from 'react';
import { Radio } from 'lucide-react';

function BackgroundView({ 
  isPlaying, 
  currentTrack, 
  currentScene = 'sunset'
}) {
  const scenes = [
    { id: 'sunset', name: 'सांध्य', bg: '/assets/safar_bus_interior_tv.png' },
    { id: 'monsoon', name: 'बारिश', bg: '/assets/safar_bus_interior_tv.png' },
    { id: 'midnight', name: 'रात', bg: '/assets/old_bus_night.png' },
    { id: 'day', name: 'देहरादून', bg: '/assets/safar_bus_dehradun_express.png' }
  ];

  const activeSceneObj = scenes.find(s => s.id === currentScene) || scenes[0];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden select-none bg-black transform-gpu">
      {/* Off-screen YouTube Player Container for background audio streaming */}
      <div 
        id="youtube-player-container" 
        className="fixed -top-[9999px] -left-[9999px] w-[320px] h-[180px] opacity-[0.01] pointer-events-none -z-50 overflow-hidden" 
        aria-hidden="true"
      ></div>

      {/* Layer 1: Passing Highway Scenery (Trees & Streetlight Glows through Windshield) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
        {/* Passing Scenery Silhouette Layer */}
        <div className={`absolute top-[28%] inset-x-0 h-32 flex items-end opacity-40 transition-opacity transform-gpu ${isPlaying ? 'animate-scenery-pass' : ''}`}>
          <div className="flex shrink-0 space-x-24 px-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-end space-x-12 shrink-0">
                <div className="w-6 h-24 bg-stone-900/90 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]"></div>
                <div className="w-1 h-28 bg-stone-800"></div>
              </div>
            ))}
          </div>
          <div className="flex shrink-0 space-x-24 px-4">
            {[...Array(10)].map((_, i) => (
              <div key={`dup-${i}`} className="flex items-end space-x-12 shrink-0">
                <div className="w-6 h-24 bg-stone-900/90 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]"></div>
                <div className="w-1 h-28 bg-stone-800"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Passing Streetlamp Light Sweep across Cabin when playing */}
        {isPlaying && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden transform-gpu">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-300/10 to-transparent animate-light-sweep"></div>
          </div>
        )}
      </div>

      {/* Layer 2: Full-Screen Crisp Bus Interior Backgrounds with Smooth Cross-fade */}
      {scenes.map((scene) => {
        const isActive = scene.id === currentScene;
        return (
          <div
            key={scene.id}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out transform-gpu scale-105 ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{ backgroundImage: `url('${scene.bg}')` }}
          >
            <div className="absolute inset-0 bg-radial-vignette opacity-30 pointer-events-none"></div>
          </div>
        );
      })}

      {/* Layer 3: Title Header Banner */}
      <div className="absolute top-[11vh] sm:top-[13vh] inset-x-0 z-30 flex flex-col items-center justify-center text-center px-4 pointer-events-none transform-gpu">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-md mb-2 drop-shadow-md">
          <Radio className={`w-3.5 h-3.5 text-amber-400 ${isPlaying ? 'animate-pulse' : ''}`} />
          <span>Safar FM • 92.7 MHz • {activeSceneObj.name}</span>
        </div>

        <h1 className="font-devanagari text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-extrabold tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] leading-tight">
          सफ़र यात्री परिवहन
        </h1>

        <p className="font-retro-sub text-lg sm:text-2xl md:text-3xl text-amber-200/90 mt-1 sm:mt-2 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
          90s के सदाबहार नगमे • बस ड्राइवर की पसंद
        </p>
      </div>

      {/* Layer 4: Retro CRT Scanlines Filter */}
      <div className="absolute inset-0 crt-overlay opacity-20 pointer-events-none z-30"></div>
    </div>
  );
}

export default memo(BackgroundView);






