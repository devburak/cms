import React, { useState, useEffect } from 'react';
import { Container, Button, Grid } from '@mui/material';
import PeriodList from '../components/period/periodList';
import PeriodForm from '../components/period/periodForm';

const PeriodPage = () => {
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // PeriodList'i yeniden yüklemek için kullanılacak

    const handleEdit = (period) => {
        setSelectedPeriod(period);
        setShowForm(true);
    };

    const handleSave = () => {
        setShowForm(false);
        setSelectedPeriod(null);
        setRefreshKey((prevKey) => prevKey + 1); // PeriodList'i yenilemek için anahtarı değiştirin
    };

    const handleCancel = () => {
        setShowForm(false);
        setSelectedPeriod(null);
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2} style={{ marginTop: 20 }}>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
                        {selectedPeriod ? 'Edit Period' : 'Create New Period'}
                    </Button>
                </Grid>
                {showForm && (
                    <Grid item xs={12}>
                        <PeriodForm
                            selectedPeriod={selectedPeriod}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <PeriodList onEdit={handleEdit} refreshKey={refreshKey} />
                </Grid>
            </Grid>
        </Container>
    );
};

export default PeriodPage;
