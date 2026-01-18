import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSystem } from '../context/SystemContext';

const ProfileForm = ({ onSubmit, initialValues }) => {
  const { t } = useTranslation();
  const { languageList } = useSystem();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('nameRequired')),
    email: Yup.string().email(t('invalidEmail')).required(t('emailRequired')),
    preferredLanguage: Yup.string().required(t('preferredLanguageRequired')),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      name: '',
      email: '',
      role: '',
      preferredLanguage: 'tr',
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      const payload = { ...values };
      if (typeof payload.role === 'object' && payload.role !== null) {
        payload.role = payload.role.name;
      }
      onSubmit(payload);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box margin={2}>
        <TextField
          fullWidth
          id="name"
          name="name"
          label={t('Name') || 'Name'}
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
      </Box>
      <Box margin={2}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label={t('email')}
          value={formik.values.email}
          InputProps={{
            readOnly: true,
            disabled: true,
          }}
          disabled
        />
      </Box>

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
            {/* If you have dynamic languages */}
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
