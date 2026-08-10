import React, { useState } from 'react';
import { Users, X, Edit3, Check, UserCheck, ShieldCheck } from 'lucide-react';

export default function PassengersModal({ isOpen, onClose, onlinePassengers = [], myProfile, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(myProfile?.name || '');
  const [editMood, setEditMood] = useState(myProfile?.mood || '');
  const [editAvatar, setEditAvatar] = useState(myProfile?.avatar || '👨‍🦱');

  if (!isOpen) return null;

  const AVATARS = ['👨‍🦱', '👩', '🧔', '👦', '👧', '👨‍🦲', '👩‍🦱', '👳‍♂️', '👩‍🦰', '🕶️'];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim() || 'Safar Traveler',
        mood: editMood.trim() || 'Listening to retro bus radio',
        avatar: editAvatar
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="saloon-glass w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Real Bus Passengers
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {onlinePassengers.length} Active Real
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Live co-travelers currently connected on Dehradun Express
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* My Seat / Profile Customization Card */}
        {myProfile && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Your Ticket & Passenger Seat
              </span>
              <button
                onClick={() => {
                  setEditName(myProfile.name);
                  setEditMood(myProfile.mood);
                  setEditAvatar(myProfile.avatar);
                  setIsEditing(!isEditing);
                }}
                className="text-xs font-semibold text-amber-300 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70">Avatar:</span>
                  <div className="flex gap-1 overflow-x-auto py-1 max-w-full">
                    {AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setEditAvatar(av)}
                        className={`text-lg p-1 rounded-lg transition ${
                          editAvatar === av ? 'bg-amber-400/40 ring-2 ring-amber-400' : 'hover:bg-white/10'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Your Passenger Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />

                <input
                  type="text"
                  placeholder="Your Bus Journey Mood Note"
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />

                <button
                  type="submit"
                  className="w-full py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" /> Save Passenger Ticket Info
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-xl shrink-0">
                  {myProfile.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{myProfile.name}</span>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40 font-bold shrink-0">
                      {myProfile.seat} (You)
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 truncate mt-0.5">{myProfile.mood}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Active Passenger List */}
        <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
          <p className="text-[11px] uppercase font-bold tracking-wider text-white/50 mb-1">
            Connected Passengers ({onlinePassengers.length})
          </p>

          {onlinePassengers.map((passenger) => {
            const isMe = myProfile && passenger.id === myProfile.id;
            return (
              <div
                key={passenger.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                  isMe
                    ? 'bg-amber-500/15 border-amber-400/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shrink-0">
                    {passenger.avatar}
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black"></span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {passenger.name} {isMe && '(You)'}
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 shrink-0">
                        {passenger.seat}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/70 truncate mt-0.5">
                      {passenger.mood}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <p className="text-xs text-amber-200/80 font-retro-sub">
            “बस में सब असली यात्री साथ सफर कर रहे हैं, लाइव ट्यून-इन जारी है...”
          </p>
        </div>
      </div>
    </div>
  );
}
