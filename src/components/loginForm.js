import {
    Avatar,
    Button,
    TextField,
    FormControl,
    InputAdornment,
    IconButton,
    Link,
    Box
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import React, { useState } from 'react';
import config from '../config'; // config dosyanızın yolu
import { useTranslation } from "react-i18next";


function LoginForm({ handleLogin }) {
    const { t } = useTranslation();

    const [values, setValues] = useState({
        email: '',
        password: '',
        showPassword: false
    });

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    const handleClickShowPassword = () => {
        setValues({ ...values, showPassword: !values.showPassword });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleLogin(values.email, values.password);
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="90vh"
        >

            <Avatar
                src={config.logo}
                sx={{ width: 120, height: 120, marginBottom: 2 }}
            />
            <form onSubmit={handleSubmit}>
                <TextField
                    label={t("email")}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={values.email}
                    onChange={handleChange('email')}
                />
                <FormControl variant="outlined" fullWidth margin="normal">
                    <TextField
                        label={t("password")}
                        type={values.showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={handleChange('password')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {values.showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </FormControl>
                <Button type="submit" variant="contained" color="primary" fullWidth margin="normal">
                    {t("login")}
                </Button>

                <Box display="flex" justifyContent="space-between" width="100%" sx={{ marginTop: 4 }}>
                    {config.createAccountLink ? (
                        <Link href="#" variant="body2">
                            {t("signup")}
                        </Link>
                    ) : null}

                    <Link href="/forget-password" variant="body2">
                        {t("forget_password")}
                    </Link>
                </Box>
            </form>
        </Box>
    );
}

export default LoginForm;
