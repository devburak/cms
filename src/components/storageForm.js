import React, { useState, useEffect } from 'react';
import { getStorageVariables, getSystemVariable } from '../api';
import { Grid, Select, MenuItem, Button, FormControl, InputLabel, TextField ,Checkbox,FormGroup,FormControlLabel} from '@mui/material';
import { useTranslation } from "react-i18next";

function StorageForm() {
    const { t } = useTranslation();
    const storages = [
        { label: t("Minio"), value: "minioConfig" },
        { label: t("CloudFlare - R2"), value: "cloudflareConfig" },
        { label: t("AWS - S3"), value: "awsConfig" }
    ];
    const [storageData, setStorageData] = useState([]);
    const [preferredStorageType, setPreferredStorageType] = useState('awsConfig');
    const [currentStorage, setCurrentStorage] = useState('');

    const [s3Config, setS3Config] = useState({
        accessKeyId: '',
        secretAccessKey: '',
        bucketName: '',
        region: '',
        endPoint: ''
    });

    const [minioConfig, setMinioConfig] = useState({
        accessKey: '',
        secretKey: '',
        bucketName: '',
        region: '',
        port: 0,
        useSSL: true,
        endPoint: ''
    });
    const [cloudflareConfig, setCloudflareConfigg] = useState({
        accessKey: '',
        secretKey: '',
        bucketName: '',
        endPoint: ''
    });


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Based on the preferredStorageType, prepare the data to be sent
            let configData;
            switch (preferredStorageType) {
                case 'awsConfig':
                    configData = s3Config;
                    break;
                // Handle other storage types
                case 'minioConfig':
                    configData = minioConfig;
                    break;
                case 'cloudflareConfig':
                    configData = cloudflareConfig;
                    break;
            }
            console.log(preferredStorageType, configData)
            // await saveStorageConfiguration(preferredStorageType, configData);
            // Handle success
        } catch (error) {
            console.error(t("Error saving storage configuration:"), error);
            // Handle error
        }
    };

    // Update S3 config state
    const handleS3ConfigChange = (e) => {
        setS3Config(prevConfig => ({
            ...prevConfig,
            [e.target.name]: e.target.value
        }));
    };

    const handleCloudflareConfigChange = (e)=>{
        setCloudflareConfigg(prevConfig => ({
            ...prevConfig,
            [e.target.name]: e.target.value
        }));
    }

    const handleMinioConfigChange = (e)=>{
        if(e.target.name !== "useSSL")
            setMinioConfig(prevConfig => ({
                ...prevConfig,
                [e.target.name]: e.target.value
            }))

        if(e.target.name === "useSSL")
        setMinioConfig(prevConfig => ({
            ...prevConfig,
            useSSL: e.target.checked
        }))
        
    }

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
            <h2>{t("storage setting")}</h2>
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
            <h3>{currentStorage ? t('edit') : t('add')}</h3>
            <form onSubmit={handleSubmit}>
                {preferredStorageType === 'awsConfig' && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} >
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="accessKeyId"
                                label={t("Access Key ID")}
                                value={s3Config.accessKeyId}
                                onChange={handleS3ConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="secretAccessKey"
                                label={t("Secret Access Key")}
                                value={s3Config.secretAccessKey}
                                onChange={handleS3ConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="bucketName"
                                label={t("Bucket Name")}
                                value={s3Config.bucketName}
                                onChange={handleS3ConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="region"
                                label={t("Region")}
                                value={s3Config.region}
                                onChange={handleS3ConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="endPoint"
                                label={t("End Point")}
                                value={s3Config.endPoint}
                                onChange={handleS3ConfigChange}
                                required
                            />
                        </Grid>
                        
                    </Grid>
                )} {preferredStorageType === 'minioConfig' && ( 
                    <Grid container spacing={2}>
                        <Grid item xs={12} >
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="accessKey"
                                label={t("Access Key ID")}
                                value={minioConfig.accessKey}
                                onChange={handleMinioConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="secretKey"
                                label={t("Secret Access Key")}
                                value={minioConfig.secretKey}
                                onChange={handleMinioConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="bucketName"
                                label={t("Bucket Name")}
                                value={minioConfig.bucketName}
                                onChange={handleMinioConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6} sm={3} >
                        <TextField
                                fullWidth
                                variant="outlined"
                                type='number'
                                name="port"
                                label={t("Port")}
                                value={minioConfig.port}
                                onChange={handleMinioConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6} sm={3} style={{display:"flex" ,alignItems:"center"}}>
                            <FormGroup>
                                <FormControlLabel control={<Checkbox
                                    name="useSSL"
                                    checked={minioConfig.useSSL}
                                    onChange={handleMinioConfigChange}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />} label="SLL" />
                            </FormGroup>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="endPoint"
                                label={t("End Point")}
                                value={minioConfig.endPoint}
                                onChange={handleMinioConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="region"
                                label={t("Region")}
                                value={minioConfig.region}
                                onChange={handleMinioConfigChange}
                            />
                        </Grid>
                     
                    </Grid>
                )}
                 {preferredStorageType === 'cloudflareConfig' && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} >
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="accessKey"
                                label={t("Access Key")}
                                value={cloudflareConfig.accessKey}
                                onChange={handleCloudflareConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="secretKey"
                                label={t("Secret Key")}
                                value={cloudflareConfig.secretKey}
                                onChange={handleCloudflareConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="bucketName"
                                label={t("Bucket Name")}
                                value={cloudflareConfig.bucketName}
                                onChange={handleCloudflareConfigChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="endPoint"
                                label={t("End Point")}
                                value={cloudflareConfig.endPoint}
                                onChange={handleCloudflareConfigChange}
                                required
                            />
                        </Grid>
                        
                    </Grid>
                )}  
                <Grid container spacing={2}>
                    <Grid item xs={6} my={2}>
                        <Button variant="contained" color="primary" type="submit" fullWidth>
                            {t('save')}
                        </Button>
                    </Grid>
                    <Grid item xs={6}>

                    </Grid>
                </Grid>
            </form>
        </div>
    );
}

export default StorageForm;
