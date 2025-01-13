import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import config from '../config';
import { useTranslation } from 'react-i18next';

const PreviewLink = ({ contentId }) => {
    const { t } = useTranslation();
    const token = localStorage.getItem('accessToken');

    const generatePreviewLink = () => {
        if (contentId && token) {
            return `${config.frontEndUrl}preview/${contentId}?token=${token}`;
        }
        return null;
    };

    const previewLink = generatePreviewLink();


    return (
        <Box sx={{ mt: 2 }}>
            {contentId ? (
                <Box sx={{marginBottom: '4px'}}>
                    <Typography variant="body1" gutterBottom>
                        {t('Preview Link')}:
                    </Typography>
                    <Typography
                        variant="body2"
                        component="a"
                        href={previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: 'primary.main',
                            textDecoration: 'underline',
                            display: 'inline-block',
                            maxWidth: '200px', // Görünecek alanın genişliği
                            whiteSpace: 'nowrap', // Tek satırda tut
                            overflow: 'hidden', // Taşan metni gizle
                            textOverflow: 'ellipsis', // Gizlenen kısmı "..." ile belirt
                            cursor: 'pointer', // Link görünümü
                          }}    
                          title={previewLink}
                    >
                        {previewLink}
                    </Typography>
                </Box>
            ) : (
                <Button
                    variant="outlined"
                    color="primary"
                    disabled
                    sx={{ marginBottom: '4px' }}

                >
                    {t('save for preview')}
                </Button>
            )}
        </Box>
    );
};

export default PreviewLink;
