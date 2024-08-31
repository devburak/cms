import React from 'react';
import AppTokenForm from '../components/appToken/AppTokenForm';
import AppTokenList from '../components/appToken/AppTokenList';

const AppTokensPage = () => {
  return (
    <div>
      <AppTokenForm />
      <AppTokenList />
    </div>
  );
};

export default AppTokensPage;
