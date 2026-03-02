import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import MenuManager from '../components/menu/MenuManager';

const MenuPage = () => (
  <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Menu Yonetimi
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Birden fazla menu tanimlayin, item hiyerarsisi kurun ve degisiklikleri webhook ile client uygulamalarina iletin.
      </Typography>
    </Box>
    <MenuManager />
  </Container>
);

export default MenuPage;
