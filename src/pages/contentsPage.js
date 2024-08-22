import React, { useState, useEffect } from 'react';
import ContentList from '../components/content/ContentList';
import { Container } from '@mui/material';

const ContentsPage = () => {
    return (
        <Container maxWidth="lg">
          <div style={{ padding: 10 }}>
            <ContentList/>
          </div>
        </Container>
      );
    };
    
    export default ContentsPage;