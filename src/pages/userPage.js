import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Container, Button } from '@mui/material';
import UserForm from '../components/userForm'; // UserForm bileşeninizin doğru yolunu ekleyin
import { getUserById } from '../api'; // API işlemleri için
import Notification from '../components/informations/notification';

const UserPage = () => {
  const { id } = useParams(); // URL'den id parametresini alıyoruz
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleSave = () => {
    setNotification({ open: true, message: 'User saved successfully!', severity: 'success' });
    navigate('/users'); // Kullanıcılar listesine geri döner
  };

  const handleError = (errorMessage) => {
    setNotification({ open: true, message: errorMessage, severity: 'error' });
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        {id ? 'Update User' : 'Create New User'}
      </Typography>
      <UserForm
        userId={id}
        onSave={handleSave}
        onError={handleError} // Hata durumunu handle etmek için
      />
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
      <Button fullWidth color="secondary" onClick={() => navigate('/users')}>
        Back to Users
      </Button>
    </Container>
  );
};

export default UserPage;
