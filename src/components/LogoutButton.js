import React from 'react';
import { Button } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext is set up
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // For translations

const LogoutButton = () => {
    const { isLoggedIn, logout } = useAuth(); // Destructure the necessary values from AuthContext
    const navigate = useNavigate();
    const { t } = useTranslation(); // For translations

    const handleLogout = () => {
        logout();  // Call logout from AuthContext
        navigate('/login');  // Redirect to login after logout
    };

    const handleLoginRedirect = () => {
        navigate('/login'); // Navigate to login page
    };

    return (
        <>
            {isLoggedIn ? (
                <Button variant="outlined" color="inherit" onClick={handleLogout}>
                    {t("logout")} {/* Display "Logout" in the current language */}
                </Button>
            ) : (
                <Button variant="outlined" color="inherit" onClick={handleLoginRedirect}>
                    {t("login")} {/* Display "Login" in the current language */}
                </Button>
            )}
        </>
    );
};

export default LogoutButton;
