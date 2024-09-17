import React from 'react';
import CelebrationForm from '../components/celebration/CelebrationForm'; 
import { useParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';

const CelebrationPage = () => {
  const { id } = useParams(); // URL'den ID'yi al

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        {id ? '70. yıl İçeriği Güncelle' : 'Yeni 70. yıl İçeriği Ekle'}
      </Typography>
      <CelebrationForm /> {/* CelebrationForm bileşeni */}
    </Container>
  );
};

export default CelebrationPage;
