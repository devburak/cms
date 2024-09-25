import React, { useState, useEffect } from 'react';
import { Button, Box, Paper, Typography, Pagination, Grid, TextField, Autocomplete } from '@mui/material';
import CelebrationPublicationList from '../components/celebration/CelebrationPublicationList'; // The list component
import CelebrationPublicationForm from '../components/celebration/CelebrationPublicationForm'; // The form component
import { getAllCelebrationPublications, deleteCelebrationPublication, getCelebrationPublicationById, getAllPeriods, createCelebrationPublication, updateCelebrationPublication } from '../api'; // API functions
import { useNavigate } from 'react-router-dom';

const CelebrationPublicationPage = () => {
  const [publications, setPublications] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false); // To toggle between form and list
  const [currentPublicationId, setCurrentPublicationId] = useState(null); // To manage editing
  const [formInitialValues, setFormInitialValues] = useState(null); // To pass to the form when editing
  const [periods, setPeriods] = useState([]); // To store periods data
  const [page, setPage] = useState(1); // Mevcut sayfa
  const [limit] = useState(10); // Sayfa başına gösterilecek yayın sayısı
  const [totalPages, setTotalPages] = useState(1); // Toplam sayfa sayısı
  const [titleFilter, setTitleFilter] = useState(''); // Başlık filtresi
  const [selectedPeriod, setSelectedPeriod] = useState(null); // Seçilen dönem filtresi

  useEffect(() => {
    fetchPublications();
    fetchPeriods(); // Fetch periods data when the page loads
  }, [page]);

  const fetchPublications = async () => {
    try {
      const data = await getAllCelebrationPublications({
        limit, 
        page, 
        title: titleFilter,
        period: selectedPeriod ? selectedPeriod._id : ''
      });
      setPublications(data.publications || []);
      setTotalPages(data.totalPages || 1); // Toplam sayfa sayısını ayarla
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  const fetchPeriods = async () => {
    try {
      const periodsData = await getAllPeriods();
      setPeriods(periodsData.periods || []);
    } catch (error) {
      console.error('Error fetching periods:', error);
      setPeriods([]); // Hata durumunda da periods'u boş dizi olarak ayarla
    }
  };

  const handleEdit = async (id) => {
    try {
      const publication = await getCelebrationPublicationById(id);
      setFormInitialValues(publication); // Set the current values for editing
      setCurrentPublicationId(id); // Set the current publication ID
      setIsFormOpen(true); // Open the form for editing
    } catch (error) {
      console.error('Error fetching publication for editing:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCelebrationPublication(id);
      fetchPublications(); // Refresh list after deletion
    } catch (error) {
      console.error('Error deleting publication:', error);
    }
  };

  // Kaydetme işlemi
  const handleFormSave = async (publicationData) => {
    try {
      if (currentPublicationId) {
        // Güncelleme işlemi
        await updateCelebrationPublication(currentPublicationId, publicationData);
      } else {
        // Yaratma işlemi
        await createCelebrationPublication(publicationData);
      }

      fetchPublications(); // Listeyi yenile
      setIsFormOpen(false); // Formu kapat
    } catch (error) {
      console.error('Error saving publication:', error);
    }
  };

  const handleCreateNew = () => {
    setFormInitialValues(null); // Reset the form values
    setCurrentPublicationId(null); // Reset current ID
    setIsFormOpen(true); // Open the form for creating
  };

  const handleCancelForm = () => {
    setIsFormOpen(false); // Close the form without saving
  };

  const handlePageChange = (event, value) => {
    setPage(value); // Mevcut sayfayı değiştir
  };

  const handleFilterChange = () => {
    setPage(1); // Filtreleme sonrası sayfayı sıfırla
    fetchPublications(); // Filtrelenmiş sonuçları çek
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange(); // Enter'a basıldığında filtreleme yap
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Celebration Publications
      </Typography>
      {!isFormOpen && (
        <Box>
          
          {/* Filtreleme Alanı */}
      <Grid container spacing={2} alignItems="center" style={{ paddingBottom: 16 }}>
            <Grid item xs={6} sm={12}>
            <Button variant="contained" fullWidth color="primary" onClick={handleCreateNew}>
                Create New Publication
              </Button>
            </Grid>
            <Grid item xs={6} sm={12}>
              
            </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Başlık Ara"
            variant="outlined"
            fullWidth
            size="small"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            onKeyPress={handleKeyPress} // Enter'a basıldığında filtreleme
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Autocomplete
            options={periods}
            size="small"
            getOptionLabel={(option) => {
              const startDateFormatted = option.startDate ? new Date(option.startDate).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }) : '';
              
              const endDateFormatted = option.endDate ? new Date(option.endDate).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }) : '';
            
              return option?.name ? `${option.name} (${startDateFormatted} - ${endDateFormatted})` : '';
            }}
            value={selectedPeriod}
            onChange={(event, newValue) => setSelectedPeriod(newValue)}
            renderInput={(params) => <TextField {...params} label="Dönem Seç" variant="outlined" fullWidth />}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <Button variant="outlined" fullWidth color="primary" onClick={handleFilterChange}>
            Filtrele
          </Button>
        </Grid>
      </Grid>

          <CelebrationPublicationList 
            publications={publications} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />

          {/* Pagination component */}
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            sx={{ mt: 2 }} 
          />
        </Box>
      )}

      {/* Form */}
      {isFormOpen && (
        <Paper elevation={3} sx={{ padding: 2 }}>
          <CelebrationPublicationForm
            initialValues={formInitialValues}
            onSave={handleFormSave}
            onCancel={handleCancelForm}
            publicationId={currentPublicationId}
            periods={periods}
          />
        </Paper>
      )}
    </Box>
  );
};

export default CelebrationPublicationPage;
