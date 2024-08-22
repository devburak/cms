import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSystem } from '../context/SystemContext'; // Sistem bilgilerine erişmek için

const ProfileForm = ({ onSubmit, initialValues }) => {
  const { t } = useTranslation();
  const { languageList } = useSystem(); // Sistem bilgilerinden dil seçeneklerini al

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(t('usernameRequired')),
    name: Yup.string().required(t('nameRequired')),
    email: Yup.string().email(t('invalidEmail')).required(t('emailRequired')),
    role: Yup.string().required(t('roleRequired')),
    phone: Yup.string(),
    preferredLanguage: Yup.string().required(t('preferredLanguageRequired')),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      username: '',
      name: '',
      email: '',
      role: '',
      phone: '',
      preferredLanguage: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Diğer TextField ve Select bileşenleri buraya eklenecek */}
      <Box margin={2}>
        <TextField
          fullWidth
          id="username"
          name="username"
          label={t('username')}
          value={formik.values.username}
          onChange={formik.handleChange}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
      </Box>
      {/* ... */}
      <Box margin={2}>
        <FormControl fullWidth>
          <InputLabel id="preferredLanguage-label">{t('preferredLanguage')}</InputLabel>
          <Select
            labelId="preferredLanguage-label"
            id="preferredLanguage"
            name="preferredLanguage"
            value={formik.values.preferredLanguage}
            onChange={formik.handleChange}
            label={t('preferredLanguage')}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="tr">Türkçe</MenuItem>

            {/* {languageList && languageList.map((option) => (
              <MenuItem key={option.code} value={option.code}>
                {option.name}
              </MenuItem>
            ))} */}
          </Select>
        </FormControl>
      </Box>
      <Box margin={2}>
        <Button color="primary" variant="contained" fullWidth type="submit">
          {t('save')}
        </Button>
      </Box>
    </form>
  );
};

export default ProfileForm;
