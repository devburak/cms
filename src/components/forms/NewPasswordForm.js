import React, { useState } from 'react';
import { TextField, Button, Typography, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../../api';

const NewPasswordForm = () => {
  const { t } = useTranslation();
  const { token: urlToken } = useParams(); // URL'den token al
  const [token, setToken] = useState(urlToken || ''); // Token state'i
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false); // Uyarı için state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    if (!token) {
      setMessage(t('tokenRequired'));
      setError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMessage(t('passwordsDoNotMatch'));
      setError(true);
      return;
    }

    try {
      await resetPassword(token, password);
      setMessage(t('passwordResetSuccess'));
      setError(false);
    } catch (error) {
      setMessage(t('passwordResetError'));
      setError(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">{t('newPasswordTitle')}</Typography>
      <form onSubmit={handleSubmit}>
        {!urlToken && (
          <TextField
            label={t('resetToken')}
            type="text"
            fullWidth
            size='small'
            margin="normal"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            error={error && !token}
            helperText={error && !token ? t('tokenRequired') : ''}
          />
        )}
        <TextField
          label={t('newPassword')}
          type="password"
          size='small'
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          error={error && password !== confirmPassword}
          helperText={
            error && password !== confirmPassword ? t('passwordsDoNotMatch') : ''
          }
        />
        <TextField
          label={t('confirmNewPassword')}
          type="password"
          fullWidth
          margin="normal"
          size='small'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          error={error && password !== confirmPassword}
          helperText={
            error && password !== confirmPassword ? t('passwordsDoNotMatch') : ''
          }
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          {t('updatePassword')}
        </Button>
        {message && (
          <Typography
            variant="body1"
            color={message.includes('success') ? 'green' : 'error'}
            style={{ marginTop: '10px' }}
          >
            {message}
          </Typography>
        )}
      </form>
    </Container>
  );
};

export default NewPasswordForm;
