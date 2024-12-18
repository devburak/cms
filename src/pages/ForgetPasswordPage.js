import React from 'react';
import { Box } from '@mui/material';
import ForgetPasswordForm from '../components/forms/ForgetPasswordForm';

const ForgetPasswordPage = () => {
  return  <Box
  display="flex"
  flexDirection="column"
  alignItems="center"
  justifyContent="center"
  height="90vh"
><ForgetPasswordForm /></Box>;
};

export default ForgetPasswordPage;
