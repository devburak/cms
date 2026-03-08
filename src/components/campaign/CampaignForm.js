import React, { useState, useEffect, useMemo } from 'react';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Typography
} from '@mui/material';
import FeaturedImageUpload from '../file/featuredImage';
import { getCampaignById, createCampaign, updateCampaign } from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import { notifyError, notifySuccess } from '../../services/notificationBus';

const PLACEMENT_OPTIONS = [
  { value: 'banner', label: 'Banner' },
  { value: 'popup', label: 'Popup' },
  { value: 'footer', label: 'Footer' },
  { value: 'left_menu', label: 'Sol Menü' }
];

const TARGET_PAGE_OPTIONS = [
  { value: 'home', label: 'Anasayfa' },
  { value: 'all', label: 'Tüm Sayfalar' },
  { value: 'detail', label: 'Detay Sayfaları' }
];

const POPUP_FREQUENCY_OPTIONS = [
  { value: 'every_login', label: 'Her girişte göster' },
  { value: 'daily', label: 'Günde bir kez göster' },
  { value: 'once', label: 'Sadece bir kez göster' }
];

const dedupeArray = (value) => [...new Set(Array.isArray(value) ? value : [])];

const toTargetPages = (campaign) => {
  if (Array.isArray(campaign?.targetPages) && campaign.targetPages.length > 0) {
    return dedupeArray(campaign.targetPages);
  }

  const fallback = [];
  if (campaign?.displayOnHome) fallback.push('home');
  if (campaign?.displayOnDetail) fallback.push('detail');
  return fallback;
};

const withTargetPageRules = (targetPages) => {
  const normalized = dedupeArray(targetPages);
  if (normalized.includes('all')) {
    return ['all'];
  }
  return normalized.filter((page) => page !== 'all');
};

const normalizeCampaignFromApi = (data = {}) => {
  return {
    ...data,
    title: data.title || '',
    link: data.link || '',
    horizontalMedia: data.horizontalMedia || { mediaType: 'image', url: '', mediaId: null },
    squareMedia: data.squareMedia || { mediaType: 'image', url: '', mediaId: null },
    placement: data.placement || 'banner',
    priority: typeof data.priority === 'number' ? data.priority : 0,
    targetPages: toTargetPages(data),
    popupFrequency: data.popupFrequency || 'every_login',
    isActive: typeof data.isActive === 'boolean' ? data.isActive : true
  };
};

const CampaignForm = () => {
  const [campaign, setCampaign] = useState({
    title: '',
    link: '',
    horizontalMedia: { mediaType: 'image', url: '', mediaId: null },
    squareMedia: { mediaType: 'image', url: '', mediaId: null },
    placement: 'banner',
    priority: 0,
    targetPages: [],
    popupFrequency: 'every_login',
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchCampaign(id);
  }, [id]);

  const fetchCampaign = async (campaignId) => {
    try {
      const data = await getCampaignById(campaignId);
      setCampaign(normalizeCampaignFromApi(data));
    } catch (error) {
      console.error('Error fetching campaign:', error);
      notifyError('Kampanya bilgileri alınamadı.');
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setCampaign((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMediaChange = (media, type) => {
    setCampaign((prev) => ({
      ...prev,
      [type]: { ...prev[type], ...media }
    }));
  };

  const handleToggleTargetPage = (page) => {
    setCampaign((prev) => {
      const current = new Set(prev.targetPages || []);
      if (current.has(page)) {
        current.delete(page);
      } else {
        current.add(page);
      }
      return {
        ...prev,
        targetPages: withTargetPageRules(Array.from(current))
      };
    });
  };

  const payload = useMemo(() => {
    const normalizedTargetPages = withTargetPageRules(campaign.targetPages);
    const includesAll = normalizedTargetPages.includes('all');

    return {
      title: campaign.title,
      link: campaign.link,
      horizontalMedia: campaign.horizontalMedia,
      squareMedia: campaign.squareMedia,
      placement: campaign.placement,
      priority: campaign.priority,
      targetPages: normalizedTargetPages,
      popupFrequency: campaign.placement === 'popup' ? campaign.popupFrequency : 'every_login',
      displayOnHome: includesAll || normalizedTargetPages.includes('home'),
      displayOnDetail: includesAll || normalizedTargetPages.includes('detail'),
      isActive: campaign.isActive
    };
  }, [campaign]);

  const handleSave = async () => {
    if (!payload.title?.trim()) {
      notifyError('Başlık zorunludur.');
      return;
    }

    if (!payload.targetPages.length) {
      notifyError('En az bir görünme sayfası seçmelisiniz.');
      return;
    }

    setSaving(true);
    try {
      if (id) {
        await updateCampaign(id, payload);
      } else {
        await createCampaign(payload);
      }
      notifySuccess(id ? 'Kampanya güncellendi.' : 'Kampanya oluşturuldu.');
      navigate('/campaigns');
    } catch (error) {
      console.error('Error saving campaign:', error);
      notifyError(error?.response?.data?.error || 'Kampanya kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container style={{ padding: 16 }} component={Paper} maxWidth="lg">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Başlık" name="title" value={campaign.title} onChange={handleChange} fullWidth required />
        </Grid>

        <Grid item xs={12}>
          <TextField label="Link" name="link" value={campaign.link || ''} onChange={handleChange} fullWidth />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="campaign-placement-label">Görünüm Konumu</InputLabel>
            <Select
              labelId="campaign-placement-label"
              name="placement"
              value={campaign.placement}
              label="Görünüm Konumu"
              onChange={handleChange}
            >
              {PLACEMENT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={campaign.placement !== 'popup'}>
            <InputLabel id="campaign-popup-frequency-label">Popup Gösterim Sıklığı</InputLabel>
            <Select
              labelId="campaign-popup-frequency-label"
              name="popupFrequency"
              value={campaign.popupFrequency}
              label="Popup Gösterim Sıklığı"
              onChange={handleChange}
            >
              {POPUP_FREQUENCY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {campaign.placement === 'popup'
                ? 'Popup kampanyaları için gösterim sıklığını seçin.'
                : 'Bu alan sadece popup konumu seçildiğinde aktiftir.'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Öncelik Sırası"
            name="priority"
            type="number"
            value={campaign.priority}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 0 }}
            helperText={campaign.placement === 'left_menu' 
              ? 'Sol menüde sıralama için kullanılır. Düşük sayı üstte görünür.'
              : 'Banner için yalnızca 1 aktif kampanya olabilir.'}
            disabled={campaign.placement === 'banner'}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Hangi Sayfalarda Görünsün?
          </Typography>
          <FormGroup row>
            {TARGET_PAGE_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Switch
                    checked={(campaign.targetPages || []).includes(option.value)}
                    onChange={() => handleToggleTargetPage(option.value)}
                    name={`target_${option.value}`}
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
          <FormHelperText>
            "Tüm Sayfalar" seçilirse diğer seçimler otomatik olarak bu kapsama girer.
          </FormHelperText>
        </Grid>

        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2, padding: 2 }}>
          <Grid item sm={6} xs={12}>
            <FeaturedImageUpload
              handleFeaturedImage={(image) => handleMediaChange(image, 'horizontalMedia')}
              initialFile={campaign.horizontalMedia}
              sx={{ width: '400px', height: '100px' }}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <FeaturedImageUpload
              handleFeaturedImage={(image) => handleMediaChange(image, 'squareMedia')}
              initialFile={campaign.squareMedia}
              sx={{ width: '120px', height: '120px' }}
            />
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch checked={campaign.isActive} onChange={handleChange} name="isActive" />}
            label="Aktif"
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : id ? 'Güncelle' : 'Oluştur'}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CampaignForm;
