// pages/SystemSettings.js
import React from 'react';
import StorageForm from '../components/storageForm';
import DefaultImageSetting from '../components/settings/DefaultImageSetting';
import { useTranslation } from "react-i18next";
import { Divider, Typography, Box } from '@mui/material';

function SystemSettings() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t("system settings")}</h1>
            
            <Divider />
            
            <Box sx={{ mt: 2 }}>
                <Typography variant="h5" gutterBottom>
                    {t("Depolama Ayarları")}
                </Typography>
                <StorageForm />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
                <Typography variant="h5" gutterBottom>
                    {t("Görsel Ayarları")}
                </Typography>
                <DefaultImageSetting />
            </Box>
            
            {/* Gelecekte diğer ayar bileşenleri buraya eklenebilir */}
        </div>
    );
}

export default SystemSettings;
