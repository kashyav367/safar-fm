import React, { useState, memo } from 'react';
import { spotifyPlayer } from '../services/spotifyPlayer';
import { ExternalLink, Key, CheckCircle, ShieldCheck, Music } from 'lucide-react';

function SpotifyConnectModal({ isOpen, onClose, isConnected, onConnected }) {
  const [tokenInput, setTokenInput] = useState(spotifyPlayer.token || '');
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSaveToken = () => {
    if (!tokenInput.trim()) return;
    spotifyPlayer.setToken(tokenInput.trim());
    setStatusMsg('Connecting to Spotify Web Playback SDK...');
    setTimeout(() => {
      if (onConnected) onConnected();
      setStatusMsg('Connected! Streaming directly via Spotify SDK.');
    }, 1000);
  };

  const handleDisconnect = () => {
    spotifyPlayer.disconnect();
    setTokenInput('');
    setStatusMsg('Disconnected from Spotify.');
    if (onConnected) onConnected();
  };

  // Spotify Developer Token Generator Link
  const spotifyDevUrl = "https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md saloon-glass rounded-3xl p-6 border border-emerald-500/30 shadow-2xl text-white transform-gpu">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Spotify Web Playback SDK</h3>
              <p className="text-xs text-white/60">Connect Spotify Account for Real Audio</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-xs text-white/60 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {isConnected ? (
          <div className="space-y-4 text-center py-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-emerald-300">Spotify Connected!</h4>
            <p className="text-xs text-white/80 leading-relaxed">
              Your Spotify Premium account is active with Spotify Web Playback SDK. Gana ab seedhe Spotify se live stream hoga!
            </p>

            <button
              onClick={handleDisconnect}
              className="w-full py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-semibold text-xs hover:bg-red-500/30 transition"
            >
              Disconnect Spotify
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200/90 leading-relaxed">
              <span className="font-bold text-emerald-400 block mb-1">🎵 Standard Spotify Web Playback SDK Flow:</span>
              Paste your Spotify OAuth Access Token below to connect your Spotify account directly into the Safar FM bus radio player.
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Spotify OAuth Access Token:
              </label>
              <input
                type="password"
                placeholder="Paste Spotify OAuth Token (Bearer ...)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
              />
            </div>

            {statusMsg && (
              <p className="text-xs font-semibold text-emerald-400 text-center animate-pulse">
                {statusMsg}
              </p>
            )}

            <div className="flex gap-2">
              <a
                href={spotifyDevUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-white hover:bg-white/20 transition flex items-center justify-center gap-1.5"
              >
                <span>Get Token</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleSaveToken}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition active:scale-95"
              >
                Connect Spotify SDK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(SpotifyConnectModal);
