import React, { useEffect, useState } from 'react';
import {
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from '@mui/material';
import slugify from 'slugify';

const initialState = {
  name: '',
  description: '',
  slug: '',
  isListed: true,
  sortOrder: 0,
};

export default function DecisionCategoryForm({ selectedCategory, onSave }) {
  const [category, setCategory] = useState(initialState);

  useEffect(() => {
    if (selectedCategory) {
      setCategory({
        ...initialState,
        ...selectedCategory,
      });
      return;
    }

    setCategory(initialState);
  }, [selectedCategory]);

  const handleNameChange = (event) => {
    const name = event.target.value;
    setCategory((prev) => ({
      ...prev,
      name,
      slug: slugify(name, { lower: true, strict: true }).replace(/\./g, '-'),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(category);
    setCategory(initialState);
  };

  const handleCancel = (event) => {
    event.preventDefault();
    setCategory(initialState);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            required
            size="small"
            fullWidth
            label="Kategori Adı"
            value={category.name}
            onChange={handleNameChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            size="small"
            fullWidth
            label="Slug"
            value={category.slug}
            onChange={(event) => setCategory((prev) => ({ ...prev, slug: event.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <TextField
            size="small"
            fullWidth
            multiline
            rows={2}
            label="Açıklama"
            value={category.description}
            onChange={(event) => setCategory((prev) => ({ ...prev, description: event.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Sıralama"
            value={category.sortOrder}
            onChange={(event) => setCategory((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(category.isListed)}
                onChange={(event) =>
                  setCategory((prev) => ({ ...prev, isListed: event.target.checked }))
                }
              />
            }
            label="Listelensin"
          />
        </Grid>
        <Grid item xs={12} md={6} />
        <Grid item xs={12} md={6}>
          <Button fullWidth type="submit" variant="contained">
            {category._id ? 'Güncelle' : 'Oluştur'}
          </Button>
        </Grid>
        {category._id ? (
          <Grid item xs={12} md={6}>
            <Button fullWidth variant="outlined" color="warning" onClick={handleCancel}>
              Vazgeç
            </Button>
          </Grid>
        ) : null}
        <Grid item xs={12}>
          <Divider />
        </Grid>
      </Grid>
    </form>
  );
}
