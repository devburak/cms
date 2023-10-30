import React, { useState, useEffect } from 'react';
import { getStorageVariables, getSystemVariable } from '../api'; 
import { Select, MenuItem, Button, FormControl, InputLabel, TextField } from '@mui/material';
import { useTranslation } from "react-i18next";

function StorageForm() {
    const { t } = useTranslation();
    const storages = [
        { label: t("Minio"), value: "minio" },
        { label: t("CloudFlare - R2"), value: "r2" },
        { label: t("AWS - S3"), value: "s3" }
    ];
    const [storageData, setStorageData] = useState([]);
    const [preferredStorageType, setPreferredStorageType] = useState('');
    const [currentStorage, setCurrentStorage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getStorageVariables();
                setStorageData(data);
                const preferredType = await getSystemVariable("preferredStorageType");
                setCurrentStorage(preferredType);
            } catch (error) {
                console.error(t("Error fetching storage data:"), error);
            }
        };

        fetchData();
    }, []);

    const handleAdd = () => {
        // TODO: Yeni depolama bilgisini API'ye gönder
    };

    const handleEdit = (storage) => {
        setCurrentStorage(storage);
    };

    const handleDelete = (storageType) => {
        // TODO: Belirtilen depolama tipini API'den sil
    };

    return (
        <div>
            <h2>{t("storage") +" " +t("setting")}</h2>
            <FormControl fullWidth variant="outlined">
                <InputLabel>{t("Preferred Storage Type")}</InputLabel>
                <Select
                    value={preferredStorageType}
                    onChange={e => setPreferredStorageType(e.target.value)}
                    label={t("Preferred Storage Type")}
                >
                    {storages.map(storage => (
                        <MenuItem key={storage.value} value={storage.value}>
                            {storage.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <h3>{t("storages")}</h3>
            {Array.isArray(storageData) && storageData.map(storage => (
                <div key={storage.key}>
                    <h4>{storage.key}</h4>
                    <Button variant="contained" color="primary" onClick={() => handleEdit(storage)}>{t("edit")}</Button>
                    <Button variant="contained" color="secondary" onClick={() => handleDelete(storage.key)}>{t("delete")}</Button>
                </div>
            ))}

            <h3>{currentStorage ? t('edit') : t('add')} {t("storage")}</h3>
            <form onSubmit={currentStorage ? handleEdit : handleAdd}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label={t("type")}
                    value={currentStorage}
                    onChange={e => setCurrentStorage(e.target.value)}
                />
                {/* Diğer form alanları (endpoint, accessKey, secretKey vb.) */}
                <Button variant="contained" color="primary" type="submit">
                    {currentStorage ? t('update') : t('add')}
                </Button>
            </form>
        </div>
    );
}

export default StorageForm;
