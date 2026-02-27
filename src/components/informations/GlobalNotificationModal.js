import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { subscribeNotifications } from '../../services/notificationBus';

const GlobalNotificationModal = () => {
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    details: '',
    severity: 'error'
  });

  useEffect(() => {
    const unsubscribe = subscribeNotifications((payload) => {
      setNotification({
        title: payload.title || 'Bilgi',
        message: payload.message || 'Beklenmeyen bir hata oluştu.',
        details: payload.details || '',
        severity: payload.severity || 'error'
      });
      setOpen(true);
    });

    return unsubscribe;
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const titleColorBySeverity = {
    error: 'error.main',
    warning: 'warning.main',
    success: 'success.main',
    info: 'info.main'
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: titleColorBySeverity[notification.severity] || 'text.primary' }}>
        {notification.title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{notification.message}</DialogContentText>
        {notification.details ? (
          <DialogContentText sx={{ mt: 2, color: 'text.secondary', wordBreak: 'break-word' }}>
            {notification.details}
          </DialogContentText>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Tamam
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlobalNotificationModal;
