import React, { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import ExpertiseForm from '../components/expertise/ExpertiseForm'; // Adjust path if necessary
import ExpertiseList from '../components/expertise/ExpertiseList'; // Adjust path if necessary

const ExpertisePage = () => {
  const [editingExpertiseId, setEditingExpertiseId] = useState(null);
  const [listKey, setListKey] = useState(0); // State to force list refresh

  const handleEdit = (id) => {
    setEditingExpertiseId(id);
  };

  const handleCancelEdit = () => {
    setEditingExpertiseId(null);
  };

  const handleSaveSuccess = () => {
    setEditingExpertiseId(null); // Clear form
    setListKey(prevKey => prevKey + 1); // Trigger list refresh by changing key
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bilirkişilik Eğitimleri
      </Typography>

      <ExpertiseForm
        expertiseId={editingExpertiseId}
        onSaveSuccess={handleSaveSuccess}
        onCancel={handleCancelEdit}
      />

      <Box sx={{ mt: 4 }}>
        <ExpertiseList
          onEdit={handleEdit}
          key={listKey} // Use key to force remount/refresh of the list
        />
      </Box>
    </Container>
  );
};

export default ExpertisePage;
