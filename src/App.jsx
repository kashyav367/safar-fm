import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BackgroundView from './components/BackgroundView';
import SaloonPlayer from './components/SaloonPlayer';
import PassengersModal from './components/PassengersModal';
import AmbientSoundDeck from './components/AmbientSoundDeck';
import SpotifyConnectModal from './components/SpotifyConnectModal';
import { PLAYLISTS as LOCAL_PLAYLISTS, YOUTUBE_PLAYLISTS } from './data/playlists';
import { ambientAudio } from './services/ambientAudio';
import { youtubePlayer } from './services/youtubePlayer';
import { directAudioEngine } from './services/directAudioEngine';
import { realtimePassengerService } from './services/realtimePassengerService';
import { Radio } from 'lucide-react';

export default function App() {
  // Pending target track index when switching playlists
  const pendingTrackIndexRef = React.useRef(null);

  // Playlist & Tracks State (Defaults to Arijit & Modern Romantic YouTube Playlist)
  const [activePlaylistId, setActivePlaylistId] = useState(YOUTUBE_PLAYLISTS[0].id);
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Highway Scene State ('sunset', 'monsoon', 'midnight', 'day')
  const [currentScene, setCurrentScene] = useState('sunset');

  // Loading State
  const [loadingPlaylist, setLoadingPlaylist] = useState(true);

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

  // Helper to ensure tracks preserve valid direct MP3 audioUrl without assigning dummy MP3 to YouTube tracks
  const enrichTracksWithAudio = (rawTracks) => {
    return rawTracks.map((t) => ({
      ...t,
      audioUrl: t.audioUrl || null
    }));
  };

  // Helper to format local playlist tracks
  const formatLocalPlaylistTracks = (localPl) => {
    return localPl.tracks.map((t) => ({
      id: `local-${t.id}`,
      videoId: t.youtubeId || 'Xi6BjmipH58',
      title: t.title,
      artist: t.artist,
      movie: t.movie || 'Highway Special',
      audioUrl: t.audioUrl,
      cover: t.cover,
      duration: t.duration,
      position: t.id,
      trivia: t.trivia,
      source: 'local'
    }));
  };

  // Helper to get fallback tracks matching playlist category strictly
  const getFallbackTracks = (plId) => {
    if (plId === 'PLjSDelb8LaOfQ8pLA_uIF73qxuznCtCVC' || plId === 'arijit-modern') {
      const arijitPl = LOCAL_PLAYLISTS.find(p => p.id === 'arijit-modern');
      if (arijitPl) return formatLocalPlaylistTracks(arijitPl);
    }
    if (plId === 'PLluqBUTOXDHUjNguM2wgfaVJhC0OHTTqB' || plId === 'travelling-roadtrip') {
      const travelPl = LOCAL_PLAYLISTS.find(p => p.id === 'travelling-roadtrip');
      if (travelPl) return formatLocalPlaylistTracks(travelPl);
    }
    if (plId === 'PLMRKdK25AuPVjHl9Kdb-gkBy0Cm7Zi2xo' || plId === '90s-bollywood') {
      const bollywoodPl = LOCAL_PLAYLISTS.find(p => p.id === '90s-bollywood') || LOCAL_PLAYLISTS[0];
      if (bollywoodPl) return formatLocalPlaylistTracks(bollywoodPl);
    }
    return formatLocalPlaylistTracks(LOCAL_PLAYLISTS[0]);
  };

  // 1. Fetch or Load Playlist when activePlaylistId changes
  useEffect(() => {
    let isMounted = true;

    async function loadPlaylist() {
      try {
        setLoadingPlaylist(true);

        // Pre-populate category tracks INSTANTLY for 0ms tab switching & instant audio response
        const instantTracks = enrichTracksWithAudio(getFallbackTracks(activePlaylistId));
        if (isMounted) {
          setTracks(instantTracks);
          const targetIndex = (pendingTrackIndexRef.current !== null && pendingTrackIndexRef.current < instantTracks.length)
            ? pendingTrackIndexRef.current
            : 0;
          setCurrentTrackIndex(targetIndex);
          setLoadingPlaylist(false);

          // Play only if user clicked a song/playlist or music was already playing!
          if (isPlaying || pendingTrackIndexRef.current !== null) {
            playTrackAtIndex(targetIndex, instantTracks);
          }
        }

        // Fetch full 30-50+ YouTube Playlist tracks in background smoothly
        const res = await fetch(`/api/youtube/playlist?playlistId=${encodeURIComponent(activePlaylistId)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
            const enriched = enrichTracksWithAudio(data.tracks);
            setTracks(enriched);
          }
        }
      } catch (err) {
        console.error('[App] Background YouTube Playlist Fetch Error:', err.message);
      } finally {
        pendingTrackIndexRef.current = null;
      }
    }

    loadPlaylist();
    return () => {
      isMounted = false;
    };
  }, [activePlaylistId]);

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

  // 3. Sync Audio Engine Listeners (Direct Audio Master + YouTube CRT Sync) & Auto-Next on ENDED
  useEffect(() => {
    let lastSecond = -1;

    const unsubYtTime = youtubePlayer.onTimeUpdate((cur, dur) => {
      if (!directAudioEngine.isPlaying) {
        const currentSec = Math.floor(cur);
        if (currentSec !== lastSecond) {
          lastSecond = currentSec;
          setCurrentTime(cur);
        }
        if (dur > 0 && duration !== dur) setDuration(dur);
      }
    });

    const unsubYtState = youtubePlayer.onStateChange((state) => {
      // 1 = PLAYING, 2 = PAUSED
      if (state === 1) {
        setIsPlaying(true);
        ambientAudio.stopRadioMelody();
      } else if (state === 2) {
        if (!directAudioEngine.isPlaying && !document.hidden) {
          setIsPlaying(false);
        }
      }
    });

    const unsubYtEnded = youtubePlayer.onEnded(() => {
      if (!directAudioEngine.isPlaying) {
        console.log('[App] YT.PlayerState.ENDED received -> triggering handleNextTrack()');
        handleNextTrack();
      }
    });

    const unsubYtError = youtubePlayer.onError((errCode) => {
      console.warn(`[App] YouTube player error ${errCode} -> falling back to Direct Audio Engine`);
      const activeTrack = tracks[currentTrackIndex];
      if (activeTrack && activeTrack.audioUrl) {
        directAudioEngine.playTrack(activeTrack.audioUrl, 0);
      }
    });

    const unsubDirectTime = directAudioEngine.onTimeUpdate((cur, dur) => {
      if (directAudioEngine.isPlaying) {
        const currentSec = Math.floor(cur);
        if (currentSec !== lastSecond) {
          lastSecond = currentSec;
          setCurrentTime(cur);
        }
        if (dur > 0 && duration !== dur) setDuration(dur);
      }
    });

    const unsubDirectEnded = directAudioEngine.onEnded(() => {
      console.log('[App] DirectAudioEngine track ended -> triggering handleNextTrack()');
      handleNextTrack();
    });

    const unsubDirectError = directAudioEngine.onError(() => {
      console.warn('[App] DirectAudioEngine error -> falling back to unmuted YouTube player');
      try {
        if (youtubePlayer.player && typeof youtubePlayer.player.unMute === 'function') {
          youtubePlayer.player.unMute();
          youtubePlayer.player.setVolume(100);
        }
      } catch (e) {}
    });

    return () => {
      unsubYtTime();
      unsubYtState();
      unsubYtEnded();
      unsubYtError();
      unsubDirectTime();
      unsubDirectEnded();
      unsubDirectError();
    };
  }, [currentTrackIndex, tracks.length, duration]);

  // 3b. Mobile App Switch & Visibility Change Handler (WhatsApp / Screen Lock Support)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;

      if (document.hidden) {
        console.log('[App] Mobile app switched to background (WhatsApp opened or screen locked)');
        directAudioEngine.startSilentAnchor();
      } else {
        console.log('[App] Mobile app returned to foreground');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 3c. Sync HTML5 Media Session API for OS Background Audio Controls (Windows/Mac/Android/iOS)
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (currentTrack) {
      const artCover = currentTrack.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Safar FM Track',
        artist: currentTrack.artist && currentTrack.artist !== 'undefined' ? currentTrack.artist : 'Safar FM Highway Radio',
        album: 'Safar FM • 92.7 MHz',
        artwork: [
          { src: artCover, sizes: '96x96', type: 'image/jpeg' },
          { src: artCover, sizes: '128x128', type: 'image/jpeg' },
          { src: artCover, sizes: '192x192', type: 'image/jpeg' },
          { src: artCover, sizes: '256x256', type: 'image/jpeg' },
          { src: artCover, sizes: '384x384', type: 'image/jpeg' },
          { src: artCover, sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    }

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    const actionHandlers = [
      ['play', () => handlePlayPause()],
      ['pause', () => handlePlayPause()],
      ['previoustrack', () => handlePrevTrack()],
      ['nexttrack', () => handleNextTrack()],
      ['seekto', (details) => {
        if (details.seekTime !== undefined) {
          handleSeek(details.seekTime);
        }
      }]
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {}
    }
  }, [currentTrack, isPlaying]);

  // 4. Play current track via YouTube Player + Silent DOM Background Audio Anchor
  const playTrackAtIndex = (index, trackList = tracks) => {
    if (trackList.length === 0) return;
    const targetTrack = trackList[index];
    if (!targetTrack) return;

    console.log(`[App] Playing Track ${index + 1}/${trackList.length}: "${targetTrack.title}" (${targetTrack.videoId || targetTrack.audioUrl})`);

    setIsPlaying(true);
    setCurrentTime(0);

    // Ensure audio context and background anchor
    ambientAudio.ensureContext();
    directAudioEngine.startSilentAnchor();

    // Play track via YouTube Player when videoId is present
    if (targetTrack.videoId) {
      directAudioEngine.pause();
      youtubePlayer.loadVideo(targetTrack.videoId, true);
    } else if (targetTrack.audioUrl) {
      youtubePlayer.pause();
      directAudioEngine.playTrack(targetTrack.audioUrl, 0);
    }
  };

  // 5. Play / Pause Handler
  const handlePlayPause = () => {
    ambientAudio.ensureContext();
    directAudioEngine.startSilentAnchor();

    if (tracks.length === 0) return;

    if (isPlaying) {
      youtubePlayer.pause();
      directAudioEngine.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentTrack) {
        if (currentTrack.videoId) {
          directAudioEngine.pause();
          youtubePlayer.play();
        } else if (currentTrack.audioUrl) {
          youtubePlayer.pause();
          if (directAudioEngine.currentUrl && directAudioEngine.audio && directAudioEngine.audio.paused) {
            directAudioEngine.resume();
          } else {
            directAudioEngine.playTrack(currentTrack.audioUrl, currentTime);
          }
        }
      }
    }
  };

  // Scene rotation list
  const scenesList = ['sunset', 'monsoon', 'midnight', 'day'];

  // Rotate scene on track change for visual variety
  const rotateSceneNext = () => {
    const currentIndex = scenesList.indexOf(currentScene);
    const nextScene = scenesList[(currentIndex + 1) % scenesList.length];
    setCurrentScene(nextScene);
  };

  // 6. Next Track Handler (Wrap-around from end to 0)
  const handleNextTrack = () => {
    ambientAudio.playRadioStatic(0.3);
    if (tracks.length === 0) return;

    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    console.log(`[App] Next Track: ${currentTrackIndex} -> ${nextIndex}`);
    setCurrentTrackIndex(nextIndex);
    rotateSceneNext();
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
    directAudioEngine.seek(newTime);
    setCurrentTime(newTime);
  };

  // 9. Select Playlist Handler
  const handleSelectPlaylist = (playlistId) => {
    ambientAudio.playRadioStatic(0.4);
    if (playlistId !== activePlaylistId) {
      setActivePlaylistId(playlistId);
    }
  };

  // 10. Track Selection from Playlist Menu
  const handleSelectTrack = (playlistId, index) => {
    ambientAudio.playRadioStatic(0.4);
    if (playlistId !== activePlaylistId) {
      pendingTrackIndexRef.current = index;
      setActivePlaylistId(playlistId);
    } else {
      if (index >= 0 && index < tracks.length) {
        setCurrentTrackIndex(index);
        playTrackAtIndex(index);
      }
    }
  };

  // Update Passenger Profile
  const handleUpdateProfile = (updatedInfo) => {
    realtimePassengerService.updateProfile(updatedInfo);
    setMyProfile({ ...realtimePassengerService.myProfile });
  };

  // Cinematic Loading View
  if (loadingPlaylist && tracks.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-6 select-none">
        <div className="saloon-glass p-8 rounded-3xl border border-amber-500/30 max-w-sm flex flex-col items-center gap-4 animate-pulse">
          <div className="p-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
            <Radio className="w-8 h-8 animate-spin text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-devanagari">
              Finding your window seat...
            </h2>
            <p className="text-xs text-amber-200/80 mt-1 font-mono">
              Loading Safar FM Highway Radio • 92.7 MHz
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated UI array mapped strictly to the 3 requested YouTube Playlists
  const dynamicPlaylistForUI = YOUTUBE_PLAYLISTS.map((pl) => {
    const isCurrentPl = pl.id === activePlaylistId;
    const fallbackList = getFallbackTracks(pl.id);
    const displayTracks = isCurrentPl && tracks.length > 0
      ? tracks.map((t) => ({
          id: t.id,
          title: t.title,
          artist: t.artist && t.artist !== 'undefined' ? t.artist : 'Safar FM',
          movie: pl.hindiName || 'Safar Highway Special',
          duration: duration > 0 && currentTrack?.id === t.id ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : 'Radio Track',
          cover: t.cover
        }))
      : fallbackList.map((t) => ({
          id: t.id,
          title: t.title,
          artist: t.artist && t.artist !== 'undefined' ? t.artist : 'Safar FM',
          movie: pl.hindiName || 'Safar Highway Special',
          duration: t.duration || 'Radio Track',
          cover: t.cover
        }));

    return {
      id: pl.id,
      name: pl.name,
      hindiName: pl.hindiName,
      tagline: pl.tagline,
      category: pl.category,
      badge: pl.badge,
      tracks: displayTracks
    };
  });

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

      {/* Dynamic Animated Parallax Bus Interior & Highway Background */}
      <BackgroundView
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentScene={currentScene}
        onSelectScene={(sceneId) => setCurrentScene(sceneId)}
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
        activePlaylistId={activePlaylistId}
        onSelectPlaylist={handleSelectPlaylist}
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
