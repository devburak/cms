import React from 'react';
import { Container, Typography } from '@mui/material';
import SubmissionList from '../components/apiForms/SubmissionList';

export default function SubmissionListPage() {
  return (
    <Container sx={{ p:4 }}>
      <Typography variant="h4" gutterBottom>Submissions</Typography>
      <SubmissionList />
    </Container>
  );
}
