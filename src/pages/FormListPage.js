import React from 'react';
import { Container, Typography } from '@mui/material';
import FormList from '../components/apiForms/FormList';

export default function FormListPage() {
  return (
    <Container sx={{ p:4 }}>
      <Typography variant="h4" gutterBottom>Forms</Typography>
      <FormList />
    </Container>
  );
}
