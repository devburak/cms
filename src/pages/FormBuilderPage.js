import React from 'react';
import { Container, Typography } from '@mui/material';
import FormBuilder from '../components/apiForms/FormBuilder';
import { useNavigate, useParams } from 'react-router-dom';

export default function FormBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <Container sx={{ p:4 }}>
      <Typography variant="h4" gutterBottom>{id ? 'Edit Form' : 'New Form'}</Typography>
      <FormBuilder formId={id} onSaved={()=>navigate('/forms')} />
    </Container>
  );
}
