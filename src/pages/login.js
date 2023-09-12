import React from 'react';
import { Container, Box } from '@mui/material';
import LoginForm from '../components/loginForm';
import { login ,getProfile } from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const Login = () => {
    const { setIsLoggedIn ,setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { from } = location.state || { from: { pathname: "/" } };
    const redirectTo = from.pathname === "/login" ? "/" : from.pathname;

    const loginSubmit = async (identifier, password) => {
        try {
            const data = await login(identifier, password);
            if (data && data.accessToken && data.refreshToken) {
                setIsLoggedIn(true);  // Bu satırı ekleyin
                const user = await getProfile( data.accessToken)
                setUser(user)
                navigate(redirectTo);
            }
        } catch (error) {
            console.error("Login failed:", error);
            // Hata mesajını kullanıcıya gösterebilirsiniz.
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
                <LoginForm  handleLogin={loginSubmit} />
            </Container>
        </Box>
    );
};

export default Login;