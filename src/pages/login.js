import React from 'react';
import { useTranslation } from "react-i18next";

const Login = () => {
    const { t } = useTranslation();
  return <div>{t('loginPage')} </div>;
};

export default Login;