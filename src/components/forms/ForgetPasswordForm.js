import React, { useState } from 'react';
import { TextField, Button, Typography, Container, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { requestPasswordReset } from '../../api'; // API çağrısı

const ForgetPasswordForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Yükleme durumu

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Yükleme başlıyor
    setMessage('');
    try {
      await requestPasswordReset(email);
      setMessage(t('passwordResetLinkSent'));
    } catch (error) {
      setMessage(t('errorOccurred'));
    } finally {
      setLoading(false); // Yükleme tamamlandı
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">{t('forgotPasswordTitle')}</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label={t('email')}
          type="email"
          fullWidth
          margin="normal"
          size="small"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading} // Yükleme durumunda butonu devre dışı bırak
          startIcon={loading && <CircularProgress size={20} />} // Yükleme göstergesi
        >
          {loading ? t('sending') : t('sendResetLink')}
        </Button>
        {message && (
          <Typography
            variant="body1"
            color={message.includes(t('passwordResetLinkSent')) ? 'green' : 'error'}
            style={{ marginTop: '10px' }}
          >
            {message}
          </Typography>
        )}
      </form>
    </Container>
  );
};

export default ForgetPasswordForm;
