import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function UnderConstructionPage() {
    return (
        <Container component="main" maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Under Construction
                </Typography>
                <Typography variant="h5" component="h2">
                    Yapım Aşamasında
                </Typography>
            </Box>
        </Container>
    );
}

export default UnderConstructionPage;
