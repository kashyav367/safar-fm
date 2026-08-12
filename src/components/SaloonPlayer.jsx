import React, { useState, memo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Radio, Heart, Coffee, CloudRain, Disc, Volume2, VolumeX, MessageSquare, Sparkles } from 'lucide-react';
import { PLAYLISTS } from '../data/playlists';

function SaloonPlayer({
  currentTrack,
  currentTrackIndex,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onPrevTrack,
  onNextTrack,
  onSeek,
  activePlaylistId,
  onSelectPlaylist,
  onSelectTrack,
  customPlaylists
}) {
  const [showPlaylists, setShowPlaylists] = useState(false);
  const activePlaylists = customPlaylists && customPlaylists.length > 0 ? customPlaylists : PLAYLISTS;

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs === null || !isFinite(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLive = !duration || duration === Infinity || isNaN(duration);
  const progressPercent = isLive ? (isPlaying ? ((currentTime % 60) / 60) * 100 : 0) : ((currentTime / duration) * 100);

  return (
    <div className="fixed bottom-[3vh] sm:bottom-[4vh] inset-x-0 z-30 flex flex-col items-center px-4 pointer-events-none transform-gpu">
      {/* Main Glassmorphism Audio Player Pill */}
      <div className="w-full max-w-xl pointer-events-auto relative transform-gpu">
        
        {/* Playlist & Track Selector Dropdown Modal */}
        {showPlaylists && (
          <div className="absolute bottom-full mb-3 inset-x-0 saloon-glass rounded-2xl p-4 border border-white/20 shadow-[0_12px_48px_rgba(0,0,0,0.8)] animate-fade-in z-40">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  Safar FM Radio Stations
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30">
                    {activePlaylists.length} CHANNELS AVAILABLE
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => setShowPlaylists(false)}
                className="text-xs text-white/70 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition"
              >
                Close ✕
              </button>
            </div>

            {/* Station Quick Switcher Responsive Grid (Guarantees ALL 4 stations are 100% visible) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {activePlaylists.map((pl, idx) => {
                const isSelected = activePlaylistId === pl.id;
                return (
                  <button
                    key={`tab-${pl.id}`}
                    onClick={() => {
                      if (onSelectPlaylist) onSelectPlaylist(pl.id);
                    }}
                    className={`text-left p-2.5 rounded-xl transition-all flex flex-col justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-black border-amber-300 font-extrabold shadow-lg shadow-amber-500/20 scale-[1.02]'
                        : 'bg-white/5 text-white/90 border-white/10 hover:bg-white/15 hover:border-amber-400/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-black/20 text-black font-extrabold' : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                      }`}>
                        CH 0{idx + 1}
                      </span>
                      {isSelected && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs font-extrabold line-clamp-1 leading-tight mb-1">
                      {pl.name}
                    </p>
                    
                    <span className={`text-[9px] font-mono uppercase truncate ${
                      isSelected ? 'text-black/80 font-bold' : 'text-white/50'
                    }`}>
                      {pl.badge || pl.category}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* Song Tracklist inside Active Station */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {activePlaylists
                .filter((pl) => pl.id === activePlaylistId)
                .map((pl) => (
                  <div key={pl.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-400/20">
                      <span className="text-amber-300 font-extrabold flex items-center gap-1.5">
                        <span>{pl.name}</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        ● {pl.tracks.length} SONGS AVAILABLE
                      </span>
                    </div>

                    {pl.tracks.map((tr, idx) => {
                      const isCurrent = currentTrackIndex === idx;
                      return (
                        <button
                          key={tr.id}
                          onClick={() => {
                            if (onSelectTrack) {
                              onSelectTrack(pl.id, idx);
                            }
                            setShowPlaylists(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between border cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-500/30 border-amber-400 text-white font-semibold shadow-md'
                              : 'bg-white/5 border-transparent text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono text-amber-400 font-bold shrink-0">
                              {isCurrent && isPlaying ? '▶' : `${idx + 1}.`}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{tr.title}</p>
                              <p className="text-[10px] text-white/60 truncate">
                                {tr.artist && tr.artist !== 'undefined' ? tr.artist : 'Safar FM'} • {tr.movie && tr.movie !== 'undefined' ? tr.movie : 'Highway Special'}
                              </p>
                            </div>
                          </div>
                          {tr.duration && (
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-mono text-amber-300 shrink-0">
                              {tr.duration}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Floating Quick Channel Switcher Bar Button */}
        <div className="flex justify-center mb-1.5">
          <button
            onClick={() => setShowPlaylists(!showPlaylists)}
            className="saloon-glass-pill hover:bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
            title="Open Safar FM All 4 Radio Channels & Song List"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Radio Stations ({activePlaylists.length} Playlists)</span>
            <span className="bg-amber-400 text-black text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
              {showPlaylists ? '▼ Close' : '▲ Switch'}
            </span>
          </button>
        </div>

        {/* Player Bar Frame */}
        <div className="group relative flex items-center gap-3 sm:gap-4 rounded-full p-2.5 sm:p-3 pr-4 sm:pr-5 saloon-glass border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl transform-gpu">
          
          {/* Spinning Cassette/Record Artwork Circle */}
          <div 
            onClick={() => setShowPlaylists(!showPlaylists)}
            className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 cursor-pointer group/art"
            title="Click to Switch Radio Channels"
          >
            <div 
              className={`h-full w-full overflow-hidden rounded-full shadow-lg ring-2 ring-white/20 transition-transform ${
                isPlaying ? 'animate-spin-slow' : 'animate-spin-paused'
              }`}
            >
              <img
                src={currentTrack ? currentTrack.cover : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
                alt={currentTrack ? currentTrack.title : 'Safar FM Track'}
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Center Cassette Hole Ring */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80 ring-2 ring-amber-400/60 flex items-center justify-center">
              <Disc className="w-2.5 h-2.5 text-amber-300" />
            </div>
          </div>

          {/* Track Details & Seek Slider */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="truncate text-xs sm:text-sm font-bold text-white drop-shadow-sm">
                {currentTrack ? currentTrack.title : 'Ram Jaane Title Track'}
              </p>
              
              {/* Radio Dial Channel Tag */}
              <button
                onClick={() => setShowPlaylists(!showPlaylists)}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 hover:bg-amber-400/20 cursor-pointer"
              >
                <Radio className="w-3 h-3 text-amber-400" />
                92.7 MHz • CHANNELS
              </button>
            </div>

            <p className="truncate text-[11px] sm:text-xs text-white/70">
              {currentTrack 
                ? `${currentTrack.artist && currentTrack.artist !== 'undefined' ? currentTrack.artist : 'Safar FM'} • ${currentTrack.movie && currentTrack.movie !== 'undefined' ? currentTrack.movie : 'Highway Special'}` 
                : 'Udit Narayan, Sonu Nigam, Alka Yagnik • Ram Jaane'}
            </p>

            {/* Custom Interactive Seek Bar */}
            <div className="mt-1.5">
              <div 
                className="group/bar relative h-2 w-full cursor-pointer py-1"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  onSeek(ratio * duration);
                }}
              >
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/20">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-100" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                
                {/* Thumb */}
                <div 
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg opacity-90 transition-opacity group-hover/bar:scale-125"
                  style={{ left: `${progressPercent}%` }}
                ></div>
              </div>

              {/* Time Indicators */}
              <div className="mt-0.5 flex justify-between text-[10px] tabular-nums text-white/60 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span className="text-amber-300 font-semibold">{isLive ? '● LIVE RADIO' : formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Media Control Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Prev */}
            <button
              onClick={onPrevTrack}
              type="button"
              aria-label="Previous track"
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white active:scale-95"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Main Play / Pause */}
            <button
              onClick={onPlayPause}
              type="button"
              aria-label={isPlaying ? "Pause" : "Play"}
              className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-amber-400 text-black shadow-lg shadow-amber-400/30 transition hover:scale-105 active:scale-95 font-bold"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={onNextTrack}
              type="button"
              aria-label="Next track"
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white active:scale-95"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default memo(SaloonPlayer);
