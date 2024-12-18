import React from 'react';
import { Box } from '@mui/material';
import NewPasswordForm from '../components/forms/NewPasswordForm';

const NewPasswordPage = () => {
  return <Box
  display="flex"
  flexDirection="column"
  alignItems="center"
  justifyContent="center"
  height="90vh"
> <NewPasswordForm /></Box>;
};

export default NewPasswordPage;
