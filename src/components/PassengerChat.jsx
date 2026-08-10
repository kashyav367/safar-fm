import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';

export default function PassengerChat({ isOpen, onClose, messages = [], onSendMessage, myProfile }) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (onSendMessage) {
      onSendMessage(inputText.trim());
    }
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="saloon-glass w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl relative flex flex-col h-[75vh]">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Live Bus Cabin Chat
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                  Real Sync
                </span>
              </h2>
              <p className="text-xs text-white/60">Pass notes to driver & real online passengers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
          {messages.map((msg) => {
            const isSelf = myProfile && (msg.sender.includes(myProfile.name) || msg.sender.includes('You'));
            return (
              <div
                key={msg.id}
                className={`p-3 rounded-2xl border transition ${
                  isSelf
                    ? 'bg-amber-500/15 border-amber-400/40 ml-4'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {msg.avatar && <span className="text-sm">{msg.avatar}</span>}
                    <span className="text-xs font-bold text-amber-300">{msg.sender}</span>
                  </div>
                  <span className="text-[10px] text-white/50 font-mono">{msg.time}</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">{msg.text}</p>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="shrink-0 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Type note as ${myProfile ? myProfile.name : 'Passenger'}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/50 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="p-2.5 rounded-full bg-amber-400 text-black hover:bg-amber-300 transition active:scale-95 font-bold shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
