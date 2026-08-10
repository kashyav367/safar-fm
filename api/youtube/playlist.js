// Vercel Serverless API Function for Safar FM YouTube Playlist
// Serves /api/youtube/playlist on Vercel deployment & production

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID || 'PL2Di--NcQaJNIcXxMYUPtvxdGP2hbn0l1';

  if (!apiKey) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY environment variable missing in Vercel settings.' });
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
        console.error(`[YouTube API Vercel Error] Status: ${apiRes.status}`);
        return res.status(apiRes.status).json({ error: 'Unable to load Safar FM playlist from YouTube.' });
      }

      const data = await apiRes.json();
      if (data.items && Array.isArray(data.items)) {
        allItems = allItems.concat(data.items);
      }

      pageToken = data.nextPageToken || '';
    } while (pageToken && pageCount < 10);

    // Filter valid tracks
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
          id: item.id || `yt-${index}`,
          videoId: snippet.resourceId.videoId,
          title: snippet.title || `Highway Track ${index + 1}`,
          artist: 'YouTube',
          cover,
          position: snippet.position ?? index,
          source: 'youtube'
        };
      });

    return res.status(200).json({ playlistId, count: tracks.length, tracks });
  } catch (err) {
    console.error('[YouTube API Vercel Exception]:', err.message);
    return res.status(500).json({ error: 'Unable to load Safar FM playlist.' });
  }
}
