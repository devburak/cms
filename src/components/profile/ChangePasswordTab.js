import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Alert,
    Typography,
    Paper
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { changePassword } from '../../api';

const ChangePasswordTab = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError(t('passwordsDoNotMatch'));
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(formData.newPassword)) {
            setError(t('passwordRequirements') || 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
            return;
        }

        setLoading(true);
        try {
            await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setMessage(t('passwordResetSuccess'));
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || t('errorOccurred'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 3, maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
                {t('updatePassword')}
            </Typography>

            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label={t('currentPassword') || "Current Password"}
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label={t('newPassword')}
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label={t('confirmNewPassword')}
                    name="confirmNewPassword"
                    type="password"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <Box sx={{ mt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? t('sending') : t('updatePassword')}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default ChangePasswordTab;
