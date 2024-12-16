import React,{useState} from 'react';
import { Container, Box } from '@mui/material';
import LoginForm from '../components/loginForm';
import { login ,getProfile } from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/informations/notification';

const Login = () => {
    const { setIsLoggedIn, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { from } = location.state || { from: { pathname: "/" } };
    const redirectTo = from.pathname === "/login" ? "/" : from.pathname;

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'error',
    });

    const loginSubmit = async (email, password) => {
        try {
            const data = await login(email, password);
            if (data && data.accessToken && data.refreshToken) {
                localStorage.setItem('accessToken', data.accessToken);
                setIsLoggedIn(true);
                const user = await getProfile(data.accessToken);
                setUser(user);
                navigate(redirectTo);
            }
        } catch (error) {
            console.error("Login failed:", error);
            setNotification({
                open: true,
                message: 'Bir hata oluştu! Tekrar deneyin.',
                severity: 'error',
            });
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="95vh"
        >
            <Container maxWidth="sm">
                <LoginForm handleLogin={loginSubmit} />
                <Notification
                    open={notification.open}
                    message={notification.message}
                    severity={notification.severity}
                    onClose={() => setNotification({ open: false, message: '', severity: 'error' })}
                />
            </Container>
        </Box>
    );
};

export default Login;
