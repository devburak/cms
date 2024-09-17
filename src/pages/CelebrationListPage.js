import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCelebrations, deleteCelebration } from '../api'; // Tüm kutlamaları ve silme işlemini getiren API fonksiyonlarını içe aktar
import CelebrationList from '../components/celebration/CelebrationList'; // CelebrationList bileşenini içe aktar
import { Button, Container, Typography, Snackbar, Alert } from '@mui/material';

const CelebrationListPage = () => {
  const [celebrations, setCelebrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCelebrations();
  }, []);

  // Tüm kutlamaları API'den çek
  const fetchCelebrations = async () => {
    try {
      const data = await getAllCelebrations(); // Tüm kutlamaları getiren API çağrısı
      setCelebrations(data.celebrations);
    } catch (error) {
      console.error('Error fetching celebrations:', error);
      setError('Kutlamalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Kutlama silme işlemi
  const handleDelete = async (id) => {
    if (window.confirm('Bu kutlamayı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteCelebration(id);
        setSuccess('Kutlama başarıyla silindi.');
        fetchCelebrations(); // Kutlamalar listesini yeniden yükle
      } catch (error) {
        console.error('Error deleting celebration:', error);
        setError('Kutlama silinirken bir hata oluştu.');
      }
    }
  };

  // Düzenleme sayfasına yönlendirme
  const handleEdit = (id) => {
    navigate(`/celebrations/edit/${id}`); // Düzenleme sayfasına yönlendir
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        70. Yıl içerik Listesi
      </Typography>
      {loading ? (
        <Typography>Yükleniyor...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <CelebrationList
          celebrations={celebrations}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Snackbar bildirimleri */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CelebrationListPage;
