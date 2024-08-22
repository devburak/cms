// pages/SystemSettings.js
import React from 'react';
import StorageForm from '../components/storageForm';
import { useTranslation } from "react-i18next";
import { Divider } from '@mui/material';

function SystemSettings() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t("system settings")}</h1>
            
            <Divider />
            <StorageForm />
            {/* Gelecekte diğer ayar bileşenleri buraya eklenebilir */}
        </div>
    );
}

export default SystemSettings;
