import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BackgroundView from './components/BackgroundView';
import SaloonPlayer from './components/SaloonPlayer';
import PassengersModal from './components/PassengersModal';
import AmbientSoundDeck from './components/AmbientSoundDeck';
import SpotifyConnectModal from './components/SpotifyConnectModal';
import { PLAYLISTS as LOCAL_PLAYLISTS } from './data/playlists';
import { ambientAudio } from './services/ambientAudio';
import { youtubePlayer } from './services/youtubePlayer';
import { realtimePassengerService } from './services/realtimePassengerService';
import { Compass, Radio } from 'lucide-react';

export default function App() {
  // Dynamic YouTube Tracks State
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Loading & Error State
  const [loadingPlaylist, setLoadingPlaylist] = useState(true);
  const [playlistError, setPlaylistError] = useState(null);

  // Real-time Online Passengers State
  const [onlinePassengers, setOnlinePassengers] = useState(realtimePassengerService.getOnlinePassengers());
  const [onlineCount, setOnlineCount] = useState(realtimePassengerService.getOnlineCount());
  const [myProfile, setMyProfile] = useState(realtimePassengerService.myProfile);

  // Modals & UI State
  const [isPassengersOpen, setIsPassengersOpen] = useState(false);
  const [isAmbientOpen, setIsAmbientOpen] = useState(false);
  const [isSpotifyOpen, setIsSpotifyOpen] = useState(false);

  // Active track derived from dynamic tracks array or fallback
  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null;

  // 1. Fetch Dynamic YouTube Playlist on Mount
  useEffect(() => {
    let isMounted = true;
    async function fetchPlaylist() {
      try {
        setLoadingPlaylist(true);
        setPlaylistError(null);

        const res = await fetch('/api/youtube/playlist');
        if (!res.ok) {
          throw new Error('Unable to load Safar FM playlist. Please try again.');
        }

        const data = await res.json();
        if (isMounted) {
          if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
            setTracks(data.tracks);
          } else {
            // Fallback to local playlist tracks if empty
            const fallbackTracks = LOCAL_PLAYLISTS[0].tracks.map((t) => ({
              id: `local-${t.id}`,
              videoId: t.youtubeId || 'N0jnLZxYwYc',
              title: `${t.title} - ${t.artist}`,
              artist: t.artist,
              cover: t.cover,
              position: t.id
            }));
            setTracks(fallbackTracks);
          }
          setLoadingPlaylist(false);
        }
      } catch (err) {
        console.error('[App] Playlist Fetch Error:', err.message);
        if (isMounted) {
          // Fallback to local playlist tracks on error
          const fallbackTracks = LOCAL_PLAYLISTS[0].tracks.map((t) => ({
            id: `local-${t.id}`,
            videoId: t.youtubeId || 'N0jnLZxYwYc',
            title: `${t.title} - ${t.artist}`,
            artist: t.artist,
            cover: t.cover,
            position: t.id
          }));
          setTracks(fallbackTracks);
          setLoadingPlaylist(false);
        }
      }
    }

    fetchPlaylist();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Sync Real-time Passengers
  useEffect(() => {
    const unsubPresence = realtimePassengerService.onPresenceChange((list, count) => {
      setOnlinePassengers(list);
      setOnlineCount(count);
      setMyProfile({ ...realtimePassengerService.myProfile });
    });

    return () => {
      unsubPresence();
    };
  }, []);

  // 3. Sync YouTube Player Listeners & Auto-Next on YT.PlayerState.ENDED
  useEffect(() => {
    const unsubTime = youtubePlayer.onTimeUpdate((cur, dur) => {
      if (cur > 0) setCurrentTime(cur);
      if (dur > 0) setDuration(dur);
    });

    const unsubState = youtubePlayer.onStateChange((state) => {
      // 1 = PLAYING, 2 = PAUSED
      if (state === 1) {
        setIsPlaying(true);
        ambientAudio.stopRadioMelody();
      } else if (state === 2) {
        setIsPlaying(false);
      }
    });

    const unsubEnded = youtubePlayer.onEnded(() => {
      console.log('[App] YT.PlayerState.ENDED received -> triggering handleNextTrack()');
      handleNextTrack();
    });

    return () => {
      unsubTime();
      unsubState();
      unsubEnded();
    };
  }, [currentTrackIndex, tracks.length]);

  // 4. Play current track via YouTube Engine
  const playTrackAtIndex = (index) => {
    if (tracks.length === 0) return;
    const targetTrack = tracks[index];
    if (!targetTrack || !targetTrack.videoId) return;

    console.log(`[App] Playing Track ${index + 1}/${tracks.length}: "${targetTrack.title}" (${targetTrack.videoId})`);

    setIsPlaying(true);
    setCurrentTime(0);
    youtubePlayer.loadVideo(targetTrack.videoId, true);
  };

  // 5. Play / Pause Handler
  const handlePlayPause = () => {
    ambientAudio.ensureContext();
    if (tracks.length === 0) return;

    if (isPlaying) {
      youtubePlayer.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentTrack) {
        youtubePlayer.play();
      }
    }
  };

  // 6. Next Track Handler (Wrap-around from end to 0)
  const handleNextTrack = () => {
    ambientAudio.playRadioStatic(0.3);
    if (tracks.length === 0) return;

    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    console.log(`[App] Next Track: ${currentTrackIndex} -> ${nextIndex}`);
    setCurrentTrackIndex(nextIndex);
    playTrackAtIndex(nextIndex);
  };

  // 7. Previous Track Handler (Wrap-around from 0 to end)
  const handlePrevTrack = () => {
    ambientAudio.playRadioStatic(0.3);
    if (tracks.length === 0) return;

    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    console.log(`[App] Previous Track: ${currentTrackIndex} -> ${prevIndex}`);
    setCurrentTrackIndex(prevIndex);
    playTrackAtIndex(prevIndex);
  };

  // 8. Seek Handler
  const handleSeek = (newTime) => {
    youtubePlayer.seekTo(newTime);
    setCurrentTime(newTime);
  };

  // 9. Track Selection from Playlist Menu
  const handleSelectTrack = (playlistId, index) => {
    ambientAudio.playRadioStatic(0.4);
    if (index >= 0 && index < tracks.length) {
      setCurrentTrackIndex(index);
      playTrackAtIndex(index);
    }
  };

  // Update Passenger Profile
  const handleUpdateProfile = (updatedInfo) => {
    realtimePassengerService.updateProfile(updatedInfo);
    setMyProfile({ ...realtimePassengerService.myProfile });
  };

  // Cinematic Loading View
  if (loadingPlaylist) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-6 select-none">
        <div className="saloon-glass p-8 rounded-3xl border border-amber-500/30 max-w-sm flex flex-col items-center gap-4 animate-pulse">
          <div className="p-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
            <Radio className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-devanagari">
              Finding your window seat...
            </h2>
            <p className="text-xs text-amber-200/80 mt-1 font-mono">
              Loading Safar FM YouTube Highway Radio • 92.7 MHz
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Adapted Playlist object for SaloonPlayer compatibility
  const dynamicPlaylistForUI = [
    {
      id: 'youtube-playlist',
      name: 'सफ़र FM Highway Radio',
      tagline: `${tracks.length} Iconic Bollywood Highway Songs`,
      tracks: tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist || 'YouTube',
        movie: 'Safar Highway Special',
        duration: duration > 0 ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : '0:00',
        cover: t.cover
      }))
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden select-none bg-black">
      {/* Top Navigation Header */}
      <Header
        onlineCount={onlineCount}
        onOpenPassengers={() => setIsPassengersOpen(true)}
        onOpenAmbient={() => setIsAmbientOpen(true)}
        onOpenSpotify={() => setIsSpotifyOpen(true)}
        currentTrack={currentTrack}
      />

      {/* Single Main Vintage Bus Interior Background with Embedded YouTube Player */}
      <BackgroundView
        currentTrack={currentTrack}
        isPlaying={isPlaying}
      />

      {/* Floating Bottom Audio Player */}
      <SaloonPlayer
        currentTrack={currentTrack}
        currentTrackIndex={currentTrackIndex}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={handlePlayPause}
        onPrevTrack={handlePrevTrack}
        onNextTrack={handleNextTrack}
        onSeek={handleSeek}
        activePlaylistId="youtube-playlist"
        onSelectPlaylist={() => {}}
        onSelectTrack={handleSelectTrack}
        customPlaylists={dynamicPlaylistForUI}
      />

      {/* Modals */}
      <PassengersModal
        isOpen={isPassengersOpen}
        onClose={() => setIsPassengersOpen(false)}
        onlinePassengers={onlinePassengers}
        myProfile={myProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      <AmbientSoundDeck
        isOpen={isAmbientOpen}
        onClose={() => setIsAmbientOpen(false)}
      />

      <SpotifyConnectModal
        isOpen={isSpotifyOpen}
        onClose={() => setIsSpotifyOpen(false)}
        onConnected={() => setIsSpotifyOpen(false)}
      />
    </div>
  );
}
