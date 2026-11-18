import React, { useRef } from 'react';
import { Box, Button, Chip, Link, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import FeaturedImageUpload from '../file/featuredImage';
import { parseCampaignVideoUrl } from '../../utils/campaignVideo';

export default function CampaignMediaInput({ label, value = {}, onChange, horizontal = false }) {
  const drafts = useRef({});
  const type = value.mediaType === 'video' ? 'video' : 'image';
  const video = type === 'video' ? parseCampaignVideoUrl(value.url) : null;
  const invalid = type === 'video' && Boolean(value.url) && !value.mediaId && !video;
  const changeType = (_, next) => {
    if (!next || next === type) return;
    drafts.current[type] = value;
    onChange(drafts.current[next] || { mediaType: next, url: '', mediaId: null });
  };
  return (
    <Box component="section" aria-label={label} sx={{ minWidth: 0 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">{label}</Typography>
        <ToggleButtonGroup exclusive value={type} onChange={changeType} size="small" aria-label={`${label} türü`}>
          <ToggleButton value="image">Görsel</ToggleButton>
          <ToggleButton value="video">Video bağlantısı</ToggleButton>
        </ToggleButtonGroup>
        {type === 'image' ? (
          <FeaturedImageUpload initialFile={value} handleFeaturedImage={onChange} sx={{ width: '100%', maxWidth: horizontal ? 400 : 160, height: horizontal ? 100 : 160 }} />
        ) : (
          <>
            <TextField
              fullWidth
              label={`${label} video bağlantısı`}
              value={value.url || ''}
              onChange={event => onChange({ mediaType: 'video', url: event.target.value, mediaId: null })}
              error={invalid}
              helperText={invalid ? 'Geçerli bir YouTube veya Vimeo video bağlantısı girin.' : 'YouTube, Shorts, youtu.be veya Vimeo video bağlantısını yapıştırın.'}
              placeholder="https://www.youtube.com/watch?v=… veya https://vimeo.com/…"
            />
            {(video || value.mediaId) && (
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip size="small" label={video ? video.provider === 'youtube' ? 'YouTube' : 'Vimeo' : 'Yüklü video'} />
                {video && <Link href={video.embedUrl} target="_blank" rel="noopener noreferrer">Videoyu aç</Link>}
              </Stack>
            )}
          </>
        )}
        {value.url && <Button size="small" onClick={() => onChange({ mediaType: 'image', url: '', mediaId: null })}>Medyayı kaldır</Button>}
      </Stack>
    </Box>
  );
}
