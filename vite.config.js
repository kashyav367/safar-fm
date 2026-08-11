import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function loadEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  } catch (e) {
    console.error('Error reading .env.local:', e);
  }
}

function youtubePlaylistPlugin() {
  const cache = new Map();
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

  return {
    name: 'youtube-playlist-api',
    configureServer(server) {
      server.middlewares.use('/api/youtube/playlist', async (req, res, next) => {
        loadEnvLocal();
        const apiKey = process.env.YOUTUBE_API_KEY;
        const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const playlistId = reqUrl.searchParams.get('playlistId') || process.env.YOUTUBE_PLAYLIST_ID || 'PLjSDelb8LaOfQ8pLA_uIF73qxuznCtCVC';

        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'YOUTUBE_API_KEY missing in server environment.' }));
          return;
        }

        // Check cache
        const cached = cache.get(playlistId);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(cached.data));
          return;
        }

        try {
          let allItems = [];
          let pageToken = '';
          let pageCount = 0;

          do {
            pageCount++;
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ''}&key=${apiKey}`;
            const apiRes = await fetch(url);

            if (!apiRes.ok) {
              const errText = await apiRes.text();
              console.error(`[YouTube API Error] Status: ${apiRes.status}`, errText);
              // If cached version exists even if expired, return it on API error
              if (cached) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(cached.data));
                return;
              }
              res.statusCode = apiRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Unable to load Safar FM playlist. Please try again.' }));
              return;
            }

            const data = await apiRes.json();
            if (data.items && Array.isArray(data.items)) {
              allItems = allItems.concat(data.items);
            }

            pageToken = data.nextPageToken || '';
          } while (pageToken && pageCount < 10);

          // Clean & filter valid tracks
          const tracks = allItems
            .filter((item) => {
              const title = item.snippet?.title || '';
              const videoId = item.snippet?.resourceId?.videoId;
              return (
                videoId &&
                title !== 'Private video' &&
                title !== 'Deleted video' &&
                !title.includes('Private video') &&
                !title.includes('Deleted video')
              );
            })
            .map((item, index) => {
              const snippet = item.snippet;
              const thumbnails = snippet.thumbnails || {};
              const cover =
                thumbnails.high?.url ||
                thumbnails.medium?.url ||
                thumbnails.default?.url ||
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';

              return {
                id: item.id || `yt-${playlistId}-${index}`,
                videoId: snippet.resourceId.videoId,
                title: snippet.title || `Highway Track ${index + 1}`,
                artist: snippet.videoOwnerChannelTitle || 'Safar FM Radio',
                cover,
                position: snippet.position ?? index,
                source: 'youtube'
              };
            });

          const responseData = { playlistId, count: tracks.length, tracks };
          cache.set(playlistId, { timestamp: Date.now(), data: responseData });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(responseData));
        } catch (err) {
          console.error('[YouTube API Middleware Exception]:', err.message);
          if (cached) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(cached.data));
            return;
          }
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Unable to load Safar FM playlist.' }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), youtubePlaylistPlugin()],
});
