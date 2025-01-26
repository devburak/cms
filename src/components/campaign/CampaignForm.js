import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Paper, Switch } from '@mui/material';
import FeaturedImageUpload from '../file/featuredImage';
import { getCampaignById, createCampaign, updateCampaign } from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from '@mui/material';

const CampaignForm = () => {
  const [campaign, setCampaign] = useState({
    title: '',
    link: '',
    horizontalMedia: { mediaType: 'image', url: '' ,mediaId:null },
    squareMedia: { mediaType: '', url: '',mediaId:null },
    displayOnHome: false,
    displayOnDetail: false,
    isActive: true,
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchCampaign(id);
  }, [id]);

  const fetchCampaign = async (id) => {
    try {
      const data = await getCampaignById(id);
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setCampaign({
      ...campaign,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleMediaChange = (media, type) => {
    setCampaign({
      ...campaign,
      [type]: { ...campaign[type], ...media },
    });
  };

  const handleSave = async () => {
    try {
      if (id) {
        await updateCampaign(id, campaign);
      } else {
        await createCampaign(campaign);
      }
      navigate('/campaigns');
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  return (
    <Container style={{ padding: 16 }} component={Paper} maxWidth="lg">
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ marginBottom: 2 }}>
          <TextField
            label="Başlık"
            name="title"
            value={campaign.title}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
              <Grid container spacing={2} alignItems={'center'} sx={{ marginBottom: 2, padding: 2 }}>
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
              <Grid container spacing={2} alignItems={'center'} sx={{ marginBottom: 2, padding: 2 }}>
                  <Grid item sm={6} xs={12}>
                     
                  </Grid>
                  {/* <Grid item sm={6} xs={12}>
                      <TextField
                          label="kampanya linki"
                          name="squareMediaUrl"
                          value={campaign.squareMedia?.mediaUrl || ''}
                          onChange={(e) => handleMediaChange({ mediaUrl: e.target.value }, 'squareMedia')}
                          fullWidth
                      />
                  </Grid> */}
              </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Link"
            name="link"
            value={campaign.link || ''}
            onChange={(e) => setCampaign({ ...campaign, link: e.target.value })}
            fullWidth
          />
          <Switch
            checked={campaign.displayOnHome}
            onChange={handleChange}
            name="displayOnHome"
          />
          <label>Anasayfada Göster</label>
        </Grid>
        <Grid item xs={12}>
          <Switch
            checked={campaign.displayOnDetail}
            onChange={handleChange}
            name="displayOnDetail"
          />
          <label>Detay Sayfasında Göster</label>
        </Grid>
        <Grid item xs={12}>
          <Switch
            checked={campaign.isActive}
            onChange={handleChange}
            name="isActive"
          />
          <label>Aktif</label>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={handleSave}>
            {id ? 'Güncelle' : 'Oluştur'}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CampaignForm;
