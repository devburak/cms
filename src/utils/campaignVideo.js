// Same parser in three repositories; only module export syntax differs.
function parseCampaignVideoUrl(input) {
  if (typeof input !== 'string' || input.length > 2048) return null;
  let url;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
  const host = url.hostname.toLowerCase(),
    parts = url.pathname.split('/').filter(Boolean);
  let id, provider, hash;
  if (host === 'youtu.be') {
    if (parts.length !== 1) return null;
    id = parts[0];
    provider = 'youtube';
  } else if (
    [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'www.youtube-nocookie.com',
      'youtube-nocookie.com',
    ].includes(host)
  ) {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else if (parts.length === 2 && ['embed', 'shorts', 'live'].includes(parts[0])) id = parts[1];
    provider = 'youtube';
  } else if (['vimeo.com', 'www.vimeo.com'].includes(host)) {
    if (parts.length > 2) return null;
    [id, hash] = parts;
    provider = 'vimeo';
  } else if (host === 'player.vimeo.com' && parts.length === 2 && parts[0] === 'video') {
    id = parts[1];
    provider = 'vimeo';
  } else return null;
  if (provider === 'youtube') {
    if (!/^[A-Za-z0-9_-]{11}$/.test(id || '')) return null;
    const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
    const start = url.searchParams.get('start') || url.searchParams.get('t');
    if (start && /^\d{1,7}$/.test(start)) embed.searchParams.set('start', String(Number(start)));
    return {
      provider,
      videoId: id,
      embedUrl: embed.href,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
    };
  }
  if (!/^\d{1,12}$/.test(id || '')) return null;
  hash = url.searchParams.get('h') || hash;
  if (hash && !/^[A-Za-z0-9_-]{6,64}$/.test(hash)) return null;
  const embed = new URL(`https://player.vimeo.com/video/${id}`);
  if (hash) embed.searchParams.set('h', hash);
  return { provider, videoId: id, embedUrl: embed.href, thumbnailUrl: null };
}
export { parseCampaignVideoUrl };
