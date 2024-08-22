import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Divider, Container, Grid } from '@mui/material';
import CategoryForm from '../components/category/categoryForm';
import CategoryList from '../components/category/categoryList';
import { getCategories,createCategory ,updateCategory} from '../api'; // getCategories fonksiyonunun yolu doğru olmalı

function CategoryPage() {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [total, setTotal] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(null); // Seçilen kategoriyi tutacak durum değişkeni
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCategories = async () => {
        try {
            const response =  await getCategories(searchTerm); // Page, rowsPerPage ve searchTerm parameters
            console.log(response)
            setCategories(response);
            setTotal(response?.length);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [page, rowsPerPage, searchTerm]);

    const handleCreateOrUpdateCategory = async (categoryData) => {
        if (selectedCategory?._id) {
            await handleUpdateCategory(categoryData);
        } else {
            await handleCreateCategory(categoryData);
        }
        setSelectedCategory(null); // Formu temizle ve seçili kategoriyi sıfırla
        fetchCategories(); // Güncelleme sonrası kategorileri yeniden fetch et
    };

    const handleUpdateCategory = async (categoryData) => {
        try {
            await updateCategory(selectedCategory._id, categoryData);
            
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };
    const handleCreateCategory = async (categoryData) => {
        try {
            await createCategory(categoryData);
            // fetchCategories();
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 25));
        setPage(0); // Sayfa numarasını sıfırla
    };

    useEffect(()=>{
        console.log(selectedCategory)
    },[selectedCategory])

    return (
        <Container>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h1>{t("categories")}</h1>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                <CategoryForm categories={categories}  selectedCategory={selectedCategory} onSave={handleCreateOrUpdateCategory} />
                </Grid>
                <Grid item xs={12}>
                    <CategoryList 
                        categories={categories} 
                        page={page || 0} 
                        onEdit={setSelectedCategory} // Edit butonuna basıldığında seçilen kategoriyi ayarla
                        rowsPerPage={rowsPerPage||0} 
                        handleChangePage={handlePageChange} 
                        handleChangeRowsPerPage={handleRowsPerPageChange} 
                        total={categories?.length || 0}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}

export default CategoryPage;
