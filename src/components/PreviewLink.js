import React, { useState } from 'react';
import { Button, Alert, Box } from '@mui/material';
import config from '../config';
import { useTranslation } from 'react-i18next';
import { createContentPreviewToken } from '../api';

const PreviewLink = ({ contentId }) => {
    const { t } = useTranslation();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');

    const openPreview = async () => {
        // Open during the user gesture so popup blockers don't reject the result.
        const tab = window.open('about:blank', '_blank');
        if (!tab) {
            setError('Önizleme için açılır pencerelere izin verin.');
            return;
        }
        tab.opener = null;
        setPending(true);
        setError('');
        try {
            const { token } = await createContentPreviewToken(contentId);
            const url = new URL(`preview/${contentId}`, config.frontEndUrl);
            url.searchParams.set('preview', token);
            tab.location.replace(url.href);
        } catch (err) {
            tab.close();
            setError('Önizleme açılamadı. Lütfen tekrar deneyin.');
        } finally {
            setPending(false);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Button variant="outlined" disabled={!contentId || pending} onClick={openPreview}>
                {contentId ? t('Preview Link') : t('save for preview')}
            </Button>
            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        </Box>
    );
};

export default PreviewLink;
