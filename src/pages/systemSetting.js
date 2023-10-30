// pages/SystemSettings.js
import React from 'react';
import StorageForm from '../components/storageForm';
import { useTranslation } from "react-i18next";

function SystemSettings() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t("system") +' '+ t("settings")}</h1>
            <StorageForm />
            {/* Gelecekte diğer ayar bileşenleri buraya eklenebilir */}
        </div>
    );
}

export default SystemSettings;
