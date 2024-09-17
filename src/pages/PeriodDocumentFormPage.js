import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PeriodDocumentForm from '../components/celebration/PeriodDocumentForm'; // Form bileşenini içe aktar

const PeriodDocumentFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL'den 'id' parametresini al

  const handleBack = () => {
    navigate('/period-documents'); // Geri dön butonuna basıldığında liste sayfasına yönlendir
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Paper sx={{ padding: 3 }}>
        {/* Başlık ve Geri Dön Butonu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <Typography variant="h4">
            {id ? '70. yıl Dönem Dokümanını Düzenle' : 'Yeni Dönem Dokümanı Ekle'}
          </Typography>
          <Button variant="outlined" onClick={handleBack}>
            Geri Dön
          </Button>
        </Box>

        {/* Dönem Dokümanı Formu */}
        <PeriodDocumentForm />
      </Paper>
    </Box>
  );
};

export default PeriodDocumentFormPage;
