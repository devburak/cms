import React, { useState, useEffect } from 'react';
import { Paper, Grid, TextField, Button, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { getAllChambers, createIKK, updateIKK } from '../../api'; // API fonksiyonlarını kendine göre ayarla

const socialFields = [
    'twitter', 'facebook', 'instagram', 'linkedin',
    'youtube', 'telegram', 'whatsapp', 'tiktok', 'bluesky', 'other'
  ];
  
const getEmptyForm = () => ({
  title: '',
  secretaries: [{ name: '', chamber: null }],
  address: '',
  contact: { phone: '', fax: '', email: '', website: '', social: Object.fromEntries(socialFields.map(f => [f, ''])) }
});

const IKKForm = ({ ikk, onSuccess, onError, onClear }) => {
  const { t } = useTranslation();
  const [chambers, setChambers] = useState([]);
  const [formData, setFormData] = useState(getEmptyForm());
  const [loading, setLoading] = useState(false);
  const [socialAccordionExpanded, setSocialAccordionExpanded] = useState(false);

  useEffect(() => {
    const fetchChambers = async () => {
      try {
        const chambersData = await getAllChambers();
        setChambers(chambersData.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchChambers();

    if (ikk) {
      setFormData({
        title: ikk.title || '',
        secretaries: ikk.secretaries && ikk.secretaries.length > 0
          ? ikk.secretaries.map(sec => ({ name: sec.name, chamber: sec.chamber || null }))
          : [{ name: '', chamber: null }],
        address: ikk.address || '',
        contact: {
          phone: ikk.contact?.phone || '',
          fax: ikk.contact?.fax || '',
          email: ikk.contact?.email || '',
          website: ikk.contact?.website || '',
          social: {
            twitter: ikk.contact?.social?.twitter || '',
            facebook: ikk.contact?.social?.facebook || '',
            instagram: ikk.contact?.social?.instagram || '',
            linkedin: ikk.contact?.social?.linkedin || '',
            youtube: ikk.contact?.social?.youtube || '',
            telegram: ikk.contact?.social?.telegram || '',
            whatsapp: ikk.contact?.social?.whatsapp || '',
            tiktok: ikk.contact?.social?.tiktok || '',
            bluesky: ikk.contact?.social?.bluesky || '',
            other: ikk.contact?.social?.other || '',
          },
        },
      });
    } else {
      setFormData(getEmptyForm());
    }
  }, [ikk]);

  // Form alan değişikliği
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Sekreter değişikliği
  const handleSecretaryChange = (idx, field, value) => {
    const newSecs = [...formData.secretaries];
    newSecs[idx][field] = value;
    setFormData(prev => ({ ...prev, secretaries: newSecs }));
  };

  // Sekreter satırı ekle/çıkar
  const addSecretary = () => setFormData(prev => ({
    ...prev,
    secretaries: [...prev.secretaries, { name: '', chamber: null }]
  }));

  const removeSecretary = idx => setFormData(prev => ({
    ...prev,
    secretaries: prev.secretaries.filter((_, i) => i !== idx)
  }));

  // İletişim alanı değişikliği
  const handleContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const handleSocialChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, social: { ...prev.contact.social, [field]: value } }
    }));
  };

  // Temizleme
  const handleClear = () => {
    setFormData(getEmptyForm());
    setSocialAccordionExpanded(false);
    onClear && onClear();
  };

  // Validasyon
  const validate = () => {
    if (!formData.title.trim()) return t('IKK title is required');
    for (const sec of formData.secretaries) {
      if (!sec.name.trim() || !sec.chamber) return t('Each secretary must have name and chamber');
    }
    return null;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      onError && onError(validationError);
      return;
    }
    setLoading(true);
    try {
      if (ikk && ikk._id) {
        await updateIKK(ikk._id, formData);
        onSuccess && onSuccess(t('IKK updated successfully!'));
      } else {
        await createIKK(formData);
        onSuccess && onSuccess(t('IKK created successfully!'));
      }
      handleClear();
    } catch (error) {
      onError && onError(t('Error saving IKK!'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>

          <Grid item xs={12}>
            <TextField
              label={t('IKK Title')}
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              size='small'
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={5}>
                <h3>{t('IKK Secretaries')}</h3>
              </Grid>
              <Grid item xs={7}>
                <Button onClick={addSecretary} size='small' startIcon={<AddIcon />} variant="outlined">
                  {t('Add Secretary')}
                </Button>
              </Grid>
            </Grid>
            {formData.secretaries.map((sec, idx) => (
              <Grid container spacing={2} alignItems="center" key={idx}>
                <Grid item xs={5}>
                  <TextField
                    label={t('Secretary Name')}
                    value={sec.name}
                    onChange={e => handleSecretaryChange(idx, 'name', e.target.value)}
                    fullWidth
                    size='small'
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    size="small"
                    options={chambers}
                    getOptionLabel={option => option.name}
                    onChange={(e, value) => handleSecretaryChange(idx, 'chamber', value)}
                    value={sec.chamber}
                    renderInput={params => <TextField {...params} label={t('Chamber')} variant="outlined" required />}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton size='small' onClick={() => removeSecretary(idx)} color="secondary">
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Grid>

          <Grid item xs={12}>
            <TextField
              label={t('Address')}
              name="address"
               size='small'
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          {/* Email ve Website yan yana */}
          <Grid item xs={6}>
            <TextField
              label={t('Email')}
              name="email"
               size='small'
              value={formData.contact.email}
              onChange={e => handleContactChange('email', e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={t('Website')}
              name="website"
               size='small'
              value={formData.contact.website}
              onChange={e => handleContactChange('website', e.target.value)}
              fullWidth
            />
          </Grid>

          {/* Diğer iletişim alanları */}
          <Grid item xs={6}>
            <TextField
              label={t('Phone')}
              name="phone"
               size='small'
              value={formData.contact.phone}
              onChange={e => handleContactChange('phone', e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={t('Fax')}
              name="fax"
               size='small'
              value={formData.contact.fax}
              onChange={e => handleContactChange('fax', e.target.value)}
              fullWidth
            />
          </Grid>

          {/* Sosyal medya alanları accordion içinde */}
          <Grid item xs={12}>
            <Accordion expanded={socialAccordionExpanded} onChange={() => setSocialAccordionExpanded(!socialAccordionExpanded)}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="social-media-content"
                id="social-media-header"
              >
                {t('Social Media')}
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {socialFields.map((field) => (
                    <Grid item xs={12} sm={6} md={4} key={field}>
                      <TextField
                       size='small'
                        label={t(field.charAt(0).toUpperCase() + field.slice(1))}
                        name={field}
                        value={formData.contact.social[field] || ''}
                        onChange={e => handleSocialChange(field, e.target.value)}
                        fullWidth
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Butonlar */}
          <Grid item xs={12} container justifyContent="flex-end" spacing={1}>
            <Grid item>
              <Button onClick={handleClear} variant="outlined" color="secondary">{t('Clear')}</Button>
            </Grid>
            <Grid item>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {ikk ? t('Update IKK') : t('Create IKK')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default IKKForm;