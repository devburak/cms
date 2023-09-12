import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Checkbox, FormControlLabel, Box ,Container} from '@mui/material';
import { useTranslation } from 'react-i18next';

const AddressForm = ({ onSubmit, initialValues }) => {

    const { t } = useTranslation();

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required(t('addressNameRequired'))
            .min(2, t('addressNameTooShort')),
        fullAddress: Yup.string(),
        state: Yup.string(),
        city: Yup.string(),
        district: Yup.string(),
        isUsed: Yup.boolean()
    });

    const formik = useFormik({
        initialValues: initialValues || {
            name: '',
            fullAddress: '',
            state: '',
            city: '',
            district: '',
            isUsed: false,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    return (
        <Container >
        <form onSubmit={formik.handleSubmit} >
            <Box margin={2}>
                <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label={t('addressName')}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                />
            </Box>
            <Box margin={2}>
                <TextField
                    fullWidth
                    id="fullAddress"
                    name="fullAddress"
                    multiline={true}
                    rows={2}
                    label={t('fullAddress')}
                    value={formik.values.fullAddress}
                    onChange={formik.handleChange}
                    error={formik.touched.fullAddress && Boolean(formik.errors.fullAddress)}
                    helperText={formik.touched.fullAddress && formik.errors.fullAddress}
                />
            </Box>
            <Box margin={2}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formik.values.isUsed}
                            onChange={formik.handleChange}
                            name="isUsed"
                        />
                    }
                    label={t('isUsed')}
                />
            </Box>
            <Box margin={2}>
                <Button color="primary" variant="contained" fullWidth type="submit">
                    {t('save')}
                </Button>
            </Box>
        </form>
        </Container>
    );
};

export default AddressForm;
