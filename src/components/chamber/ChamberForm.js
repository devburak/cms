// components/chamber/ChamberForm.js
import React, { useState, useEffect } from 'react';
import { Paper, Grid, TextField, Button, IconButton } from '@mui/material';
import FeaturedImage from '../file/featuredImage';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useTranslation } from 'react-i18next';
import { createChamber, updateChamber } from '../../api';

const ChamberForm = ({ chamber, onSuccess, onError }) => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        logo: null,          // Logo dosya bilgisi (File objesi)
        name: '',
        short: '',
        website: '',
        contact: {
            address: '',
            phone: '',
            email: '',
            fax: ''
        },
        socialMedia: [
            { name: '', link: '' }
        ],
        // Boards kısmını ayrı yönetebilir veya burada referans olarak ekleyebilirsiniz.
    });

    useEffect(() => {
        if (chamber) {
            setFormData({
                logo: chamber.logo || null,
                name: chamber.name,
                short: chamber.short || '',
                website: chamber.website || '',
                contact: chamber.contact || {
                    address: '',
                    phone: '',
                    email: '',
                    fax: ''
                },
                socialMedia: chamber.socialMedia || [{ name: '', link: '' }]
            });
        }
    }, [chamber]);

    // Logo seçimi (FeaturedImage ile)
    const handleLogoSelect = (file) => {
        setFormData(prev => ({ ...prev, logo: file }));
    };

    // Basit text alanları için
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Contact bilgileri için
    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contact: { ...prev.contact, [name]: value }
        }));
    };

    // Sosyal medya alanı dinamik yönetimi
    const handleSocialMediaChange = (index, field, value) => {
        const newSocialMedia = [...formData.socialMedia];
        newSocialMedia[index] = { ...newSocialMedia[index], [field]: value };
        setFormData(prev => ({ ...prev, socialMedia: newSocialMedia }));
    };

    const addSocialMediaRow = () => {
        setFormData(prev => ({
            ...prev,
            socialMedia: [...prev.socialMedia, { name: '', link: '' }]
        }));
    };

    const removeSocialMediaRow = (index) => {
        const newSocialMedia = formData.socialMedia.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, socialMedia: newSocialMedia }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (chamber) {
                await updateChamber(chamber._id, formData);
                onSuccess(t('chamberUpdated'));
            } else {
                await createChamber(formData);
                onSuccess(t('chamberCreated'));
            }
            // Reset form data
            setFormData({
                logo: null,
                name: '',
                short: '',
                website: '',
                contact: {
                    address: '',
                    phone: '',
                    email: '',
                    fax: ''
                },
                socialMedia: [{ name: '', link: '' }]
            });
        } catch (error) {
            console.error(error);
            onError(t('errorSavingChamber'));
        }
    };

    const capitalize = (str) => {
        return str.toLocaleUpperCase(i18n.language);
    };

    return (
        <Paper sx={{ p: 2 }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <FeaturedImage
                            sx={{ height: 220, width: 220 }}
                            initialFile={formData.logo}
                            handleFeaturedImage={handleLogoSelect}
                        />
                    </Grid>
                    <Grid item xs={12} sm={8} >
                    <h3>{t('Chamber Information')}</h3>
                        <TextField
                            label={t('Name')}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                            size='small'
                            required
                        />
                        <TextField
                            sx={{marginTop:2}}
                            label={t('Short')}
                            name="short"
                            value={formData.short}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            size='small'
                        />
                        <TextField
                         sx={{marginTop:2}}
                            label={t('Website')}
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            fullWidth
                            size='small'
                        />
                        {/* İletişim Bilgileri */}
                        <h3>{t('Contact Information')}</h3>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    size='small'
                                    label={t('Address')}
                                    name="address"
                                    value={formData.contact.address}
                                    onChange={handleContactChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                size='small'
                                    label={t('Phone')}
                                    name="phone"
                                    value={formData.contact.phone}
                                    onChange={handleContactChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                size='small'
                                    label={t('Email')}
                                    name="email"
                                    value={formData.contact.email}
                                    onChange={handleContactChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                size='small'
                                    label={t('Fax')}
                                    name="fax"
                                    value={formData.contact.fax}
                                    onChange={handleContactChange}
                                    fullWidth
                                />
                            </Grid>

                        </Grid>
                    </Grid>

                    {/* Sosyal Medya Alanları */}
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <h3>{t('Social Media')}</h3>
                            </Grid>
                            <Grid item xs={8}>
                                <Button onClick={addSocialMediaRow} startIcon={<AddIcon />} variant="outlined">
                                    {t('Add Social Media')}
                                </Button>
                            </Grid>
                        </Grid>
                        {formData.socialMedia.map((sm, index) => (
                            <Grid container spacing={2} alignItems="center" key={index}>
                                <Grid item xs={5}>
                                    <TextField
                                        label={t('Social Media Name')}
                                        value={sm.name}
                                        onChange={(e) => handleSocialMediaChange(index, 'name', e.target.value)}
                                        fullWidth
                                        size='small'
                                        sx={{my:1}}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label={t('Social Media Link')}
                                        value={sm.link}
                                        onChange={(e) => handleSocialMediaChange(index, 'link', e.target.value)}
                                        fullWidth
                                        size='small'
                                        sx={{my:1}}
                                    />
                                </Grid>
                                <Grid item xs={1}>
                                    <IconButton onClick={() => removeSocialMediaRow(index)} color="secondary">
                                        <RemoveIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                       
                    </Grid>
                    {/* Submit Butonu */}
                    <Grid item xs={12} container justifyContent="flex-end">
                        <Button type="submit" variant="contained" color="primary">
                            {chamber ? t('Update Chamber') : t('Create Chamber')}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default ChamberForm;