import React, { useState, useEffect } from 'react';
import {
    Grid,
    Container,
    Typography,
    Tab,
    Tabs,
    Box,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProfileForm from '../components/profileForm';
import ChangePasswordTab from '../components/profile/ChangePasswordTab';
import ActivityLogsTab from '../components/profile/ActivityLogsTab';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import { getProfile, updateProfile } from '../api';
import { useAuth } from '../context/AuthContext';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Profile = () => {
    const { t, i18n } = useTranslation(); // Get i18n to change language dynamically
    const [value, setValue] = useState(0);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { checkAuth } = useAuth(); // To update context if needed

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userData = await getProfile();
                setUser(userData);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                setError(t('failedToLoadProfile') || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [t]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleProfileUpdate = async (values) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            // values contains form data.
            // Check if language changed
            if (values.preferredLanguage && values.preferredLanguage !== i18n.language) {
                i18n.changeLanguage(values.preferredLanguage);
            }

            await updateProfile(values);
            setSuccessMessage(t('profileUpdatedSuccess') || 'Profile updated successfully');

            // Refresh user data
            const updatedUser = await getProfile();
            setUser(updatedUser);
            // Optionally update global auth context
            if (checkAuth) checkAuth();

        } catch (err) {
            console.error("Update failed", err);
            setError(err.response?.data?.message || t('updateFailed') || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                {t('profile')}
            </Typography>

            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={2}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="profile tabs">
                        <Tab icon={<PersonIcon />} iconPosition="start" label={t('general')} />
                        <Tab icon={<SecurityIcon />} iconPosition="start" label={t('Security') || 'Security'} />
                        <Tab icon={<HistoryIcon />} iconPosition="start" label={t('Logs') || 'Activity Logs'} />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    {user ? (
                        <ProfileForm
                            initialValues={user}
                            onSubmit={handleProfileUpdate}
                        />
                    ) : (
                        <Typography>{t('noUserData')}</Typography>
                    )}
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <ChangePasswordTab />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <ActivityLogsTab />
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default Profile;
