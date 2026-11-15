import React, { useState, useEffect } from 'react';
import { Grid, TextField, Button,Divider,FormControlLabel,Switch,Autocomplete } from '@mui/material';
import slugify from 'slugify';

const CategoryForm = ({ selectedCategory, onSave, onCancel, preserveSlug = false, categories=[] }) => {
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState({
    name: '',
    description: '',
    slug: '',
    isListed: false,
    parent: null
  });

  useEffect(() => {
    setCategory(selectedCategory || { name: '', description: '', slug: '', isListed: false, parent: null });
  }, [selectedCategory]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setCategory((prev) => ({
      ...prev,
      name: newTitle,
      slug: preserveSlug && selectedCategory ? prev.slug : slugify(newTitle, { lower: true, strict: true }).replace(/\./g, '-'),
    }));

    // Slug'un benzersizliğini kontrol etmek için checkSlugExists fonksiyonunu çağırabilirsiniz (opsiyonel)
    // checkSlugExists(newSlug);
  };

    // Eğer parent sadece _id olarak geldiyse, ona uygun category nesnesini bulup parent olarak ayarlayın
    useEffect(() => {
      if (typeof category.parent === 'string' && categories.length > 0) {
        const parentCategory = categories.find(cat => cat._id === category.parent);
        setCategory((prev) => ({
          ...prev,
          parent: parentCategory || null
        }));
      }
    }, [category.parent, categories]);

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setCategory((prev) => ({ ...prev, [name]: checked }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };
  const handleParentChange = (event, newValue) => {
    setCategory((prev) => ({ ...prev, parent: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (category._id) {
    //   onUpdate(category);
    // } else {
    //   onSave(category);
    // }
    setSaving(true);
    try {
      await onSave(category);
      setCategory({
        name: '',
        description: '',
        slug: '',
        isListed: false,
        parent: null
      });
    } catch { /* Hata bildirimi üst bileşende gösterilir; form korunur. */ }
    finally { setSaving(false); }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onCancel?.();
   
    setCategory({
        name: '',
        description: '',
        slug: '',
        isListed: false,
        parent: null
      })
  };


  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            size='small'
            fullWidth
            name="name"
            label="Başlık"
            value={category.name}
            onChange={handleTitleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            size='small'
            fullWidth
            name="description"
            label="Açıklama"
            value={category.description}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={6} style={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={category.isListed}
                onChange={handleSwitchChange}
                name="isListed"
                color="primary"
              />
            }
            label="Listelenecek mi?"
          />
        </Grid>
        <Grid item xs={6}>
          <Autocomplete
            options={categories.filter(item => item._id !== category._id)}
            getOptionLabel={(option) => option.name}
            value={category.parent}
            onChange={handleParentChange}
            isOptionEqualToValue={(option, value) => option._id === value?._id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Üst Kategori"
                variant="outlined"
                size="small"
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            required
            fullWidth
            size='small'
            name="slug"
            disabled={preserveSlug && Boolean(selectedCategory)}
            label="Slug"
            value={category.slug}
            onChange={(e) => setCategory((prev) => ({ ...prev, slug: e.target.value }))}
          />
        </Grid>
        <Grid item xs={6}>
          <Button fullWidth  sx={category._id ?{
            width:250
          }:{}} disabled={saving} type="submit" variant="contained" color="primary">
            {category._id ? 'Güncelle' : 'Oluştur'}
          </Button>
          {category._id ?
          <Button fullWidth  sx={{
            width:250,
            ml:2
          }}
          variant="contained" color="warning" onClick={handleCancel}>
            Vazgeç
          </Button>
          :null}
        </Grid>
        <Grid item xs={12}>
        <Divider />
        </Grid>
      </Grid>
    </form>
  );
};

export default CategoryForm;
