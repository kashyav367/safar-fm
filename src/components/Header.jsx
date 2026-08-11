import React, { useState, useEffect, memo } from 'react';
import { Volume2, VolumeX, Radio, Sparkles, ExternalLink, Compass } from 'lucide-react';
import { getTrackSpotifyUrl, getTrackYouTubeMusicUrl } from '../data/playlists';

function Header({ onlineCount, onOpenPassengers, onOpenAmbient, onOpenSpotify, currentTrack }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const spotifyUrl = getTrackSpotifyUrl(currentTrack);
  const ytMusicUrl = getTrackYouTubeMusicUrl(currentTrack);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 pointer-events-none transform-gpu">
      {/* Left: Live Clock & Highway Route Pill */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="saloon-glass-pill px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-white/90 drop-shadow">
          <span className="text-amber-400 font-mono tracking-wider">{timeStr}</span>
          <span className="w-1 h-1 rounded-full bg-white/40"></span>
          <span className="hidden md:inline-flex items-center gap-1 text-white/70">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            देहरादून एक्सप्रेस • KM 240
          </span>
        </div>
      </div>

      {/* Center: Saloon.wtf Style Online Passenger Count Pill */}
      <div className="pointer-events-auto">
        <button
          onClick={onOpenPassengers}
          className="saloon-glass-pill hover:bg-white/20 transition active:scale-95 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-white drop-shadow cursor-pointer"
          title="View Live Real-Time Bus Passenger Lounge & Seats"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 green-dot-pulse"></span>
          </span>
          <span className="font-semibold text-emerald-300">{onlineCount}</span>
          <span className="text-white/80">real online</span>
        </button>
      </div>

      {/* Right: Ambient Sound Slider, Spotify & YT Music Links */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Ambient Bus Sound FX Button */}
        <button
          onClick={onOpenAmbient}
          className="saloon-glass-pill p-2 rounded-full text-white/90 hover:bg-white/20 transition active:scale-95"
          title="Bus Sounds & Engine Hum"
        >
          <Volume2 className="w-4 h-4 text-emerald-300" />
        </button>

        {/* Dynamic Spotify Pill for currently playing track (Matching saloon.wtf) */}
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="saloon-glass-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer"
          title={`Listen to "${currentTrack ? currentTrack.title : 'Track'}" on Spotify`}
          aria-label="Spotify Track Link"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span className="hidden sm:inline font-medium">Spotify</span>
        </a>

        {/* Dynamic YT Music Pill for currently playing track */}
        <a
          href={ytMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="saloon-glass-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white hover:bg-red-500/30 transition active:scale-95"
          title={`Listen to "${currentTrack ? currentTrack.title : 'Track'}" on YouTube Music`}
          aria-label="YouTube Music Track Link"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000">
            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/>
          </svg>
          <span className="hidden sm:inline">YT Music</span>
        </a>
      </div>
    </header>
  );
}

export default memo(Header);

