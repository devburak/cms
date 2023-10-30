import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PasswordResetForm = ({ onSubmit }) => {
    const { t } = useTranslation();

    const validationSchema = Yup.object().shape({
        password: Yup.string().required(t('passwordRequired')),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], t('passwordsMustMatch'))
            .required(t('confirmPasswordRequired')),
    });

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <Box margin={2}>
                <TextField
                    fullWidth
                    type="password"
                    id="password"
                    name="password"
                    label={t('password')}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                />
            </Box>
            <Box margin={2}>
                <TextField
                    fullWidth
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    label={t('confirmPassword')}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
            </Box>
            <Box margin={2}>
                <Button color="primary" variant="contained" fullWidth type="submit">
                    {t('resetPassword')}
                </Button>
            </Box>
        </form>
    );
};

export default PasswordResetForm;