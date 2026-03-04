import React, { useEffect, useState } from 'react';
import { Container, Divider, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import {
  createDecisionCategory,
  deleteDecisionCategory,
  getDecisionCategories,
  updateDecisionCategory,
} from '../api';
import { notifyError, notifySuccess } from '../services/notificationBus';
import DecisionCategoryForm from '../components/decisionCategory/DecisionCategoryForm';
import DecisionCategoryList from '../components/decisionCategory/DecisionCategoryList';

export default function DecisionCategoriesPage() {
  const { hasPermission } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const data = await getDecisionCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching decision categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (categoryData) => {
    try {
      if (selectedCategory?._id) {
        await updateDecisionCategory(selectedCategory._id, categoryData);
        notifySuccess('Karar kategorisi güncellendi');
      } else {
        await createDecisionCategory(categoryData);
        notifySuccess('Karar kategorisi oluşturuldu');
      }

      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      notifyError(error?.response?.data?.error || 'Karar kategorisi kaydedilemedi');
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteDecisionCategory(categoryId);
      notifySuccess('Karar kategorisi silindi');
      fetchCategories();
    } catch (error) {
      notifyError(error?.response?.data?.error || 'Karar kategorisi silinemedi');
    }
  };

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h1>Karar Kategorileri</h1>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <DecisionCategoryForm
            selectedCategory={selectedCategory}
            onSave={handleSave}
          />
        </Grid>
        <Grid item xs={12}>
          <DecisionCategoryList
            categories={categories}
            onEdit={setSelectedCategory}
            onDelete={handleDelete}
            canDelete={hasPermission('deleteDecisionCategory')}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
