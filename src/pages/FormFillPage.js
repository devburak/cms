import React from 'react';
import { Container } from '@mui/material';
import FormFill from '../components/apiForms/FormFill';
import { useParams } from 'react-router-dom';

export default function FormFillPage() {
  const { submissionId } = useParams();
  return (
    <Container sx={{ p: 4 }}>
      <FormFill submissionId={submissionId} />
    </Container>
  );
}
