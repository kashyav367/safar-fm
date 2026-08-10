# 🚌 सफ़र FM • 92.7 MHz — Nostalgic Indian Highway Bus Radio

> *"Someone sitting by a bus window, traveling through India, listening to timeless Bollywood classics."*

**Safar FM** is a cinematic, atmospheric web experience designed to recreate the feeling of late-night and morning Indian highway bus journeys. Powered by **React**, **Vite**, **TailwindCSS**, and **YouTube Data API v3**, it streams authentic Bollywood 70s/80s/90s classics, ghazals, and Indipop tracks along with ambient bus soundscapes and real-time passenger interactions.

---

## ✨ Features

- 📻 **Dynamic YouTube Playlist Engine**: Powered by YouTube Data API v3 (`/api/youtube/playlist`), automatically fetching all tracks from custom YouTube playlists.
- 📺 **Official YouTube IFrame Integration**: Seamless audio playback using YouTube's official IFrame Player API with auto-next, track looping, progress seeking, and time synchronization.
- 🚍 **Cinematic Vintage Bus View**: High-definition vintage bus interior visual perspective featuring a Sikh bus driver facing the open highway.
- 🔊 **Ambient Bus Soundscape**: Toggleable ambient sound deck featuring engine idling, road hums, rain, and dhaba chai sound FX.
- 👥 **Real-Time Online Passenger Presence**: Interactive passenger deck displaying online listeners traveling together on the bus.
- 🔒 **Zero Key Exposure**: Server-side API middleware ensures `YOUTUBE_API_KEY` remains strictly protected on the server and is never exposed to client-side bundles.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TailwindCSS v4, Lucide React Icons
- **Build Tool**: Vite 8
- **Audio Engines**: YouTube IFrame Player API, Direct HTML5 Audio Engine, Web Audio API (Ambient FX)
- **API**: YouTube Data API v3 (Server-side middleware proxy)

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/kashyav367/safar-fm.git
cd safar-fm
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root directory:

```env
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
YOUTUBE_PLAYLIST_ID=PL2Di--NcQaJNIcXxMYUPtvxdGP2hbn0l1
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 📦 Production Build

```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

*Created with ❤️ for Indian nostalgia & highway journey lovers.*
