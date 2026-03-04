import React, { useEffect, useState } from 'react';
import { Container, Divider, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { deleteReportCategory, getReportCategories, createReportCategory, updateReportCategory } from '../api';
import { notifyError, notifySuccess } from '../services/notificationBus';
import ReportCategoryForm from '../components/reportCategory/ReportCategoryForm';
import ReportCategoryList from '../components/reportCategory/ReportCategoryList';

export default function ReportCategoriesPage() {
  const { hasPermission } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const data = await getReportCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching report categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (categoryData) => {
    try {
      if (selectedCategory?._id) {
        await updateReportCategory(selectedCategory._id, categoryData);
        notifySuccess('Rapor kategorisi guncellendi');
      } else {
        await createReportCategory(categoryData);
        notifySuccess('Rapor kategorisi olusturuldu');
      }

      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      notifyError(error?.response?.data?.error || 'Rapor kategorisi kaydedilemedi');
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteReportCategory(categoryId);
      notifySuccess('Rapor kategorisi silindi');
      fetchCategories();
    } catch (error) {
      notifyError(error?.response?.data?.error || 'Rapor kategorisi silinemedi');
    }
  };

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h1>Rapor Kategorileri</h1>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <ReportCategoryForm
            categories={categories}
            selectedCategory={selectedCategory}
            onSave={handleSave}
          />
        </Grid>
        <Grid item xs={12}>
          <ReportCategoryList
            categories={categories}
            onEdit={setSelectedCategory}
            onDelete={handleDelete}
            canDelete={hasPermission('deleteReportCategory')}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
