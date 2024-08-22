import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Divider, Container, Grid } from '@mui/material';
import PeriodForm from '../components/period/periodForm'; 
import PeriodList from '../components/period/periodList'; 
import { getAllPeriods, createPeriod, updatePeriod, deletePeriod } from '../api'; // Gerekli fonksiyonların import edilmesi

function PeriodPage() {
    const { t } = useTranslation();
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        try {
            const response =  await getAllPeriods();
            setPeriods(response);
        } catch (error) {
            console.error('Error fetching periods:', error);
        }
    };

    const handleCreateOrUpdatePeriod = async (periodData) => {
        if (selectedPeriod?._id) {
            await handleUpdatePeriod(periodData);
        } else {
            await handleCreatePeriod(periodData);
        }
        setSelectedPeriod(null); // Formu temizle ve seçili period'u sıfırla
        fetchPeriods(); // Güncelleme sonrası period'ları yeniden fetch et
    };

    const handleUpdatePeriod = async (periodData) => {
        try {
            await updatePeriod(selectedPeriod._id, periodData);
        } catch (error) {
            console.error('Error updating period:', error);
        }
    };

    const handleCreatePeriod = async (periodData) => {
        try {
            await createPeriod(periodData);
        } catch (error) {
            console.error('Error creating period:', error);
        }
    };

    const handleDeletePeriod = async (id) => {
        try {
            await deletePeriod(id);
            fetchPeriods(); // Silme sonrası period'ları yeniden fetch et
        } catch (error) {
            console.error('Error deleting period:', error);
        }
    };

    return (
        <Container>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h1>{t("Periods")}</h1> 
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <PeriodForm selectedPeriod={selectedPeriod} onSave={handleCreateOrUpdatePeriod} />
                </Grid>
                <Grid item xs={12}>
                    <PeriodList 
                        periods={periods} 
                        onEdit={setSelectedPeriod} // Edit butonuna basıldığında seçilen period'u ayarla
                        onDelete={handleDeletePeriod} // Silme işlemi için
                    />
                </Grid>
            </Grid>
        </Container>
    );
}

export default PeriodPage;
