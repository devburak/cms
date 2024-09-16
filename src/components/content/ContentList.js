import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, TablePagination, Grid, TextField, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllContents, deleteContent } from '../../api'; // API fonksiyonlarını içe aktarın
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../api'; // Kategorileri çekmek için API çağrısı

const ContentList = () => {
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [titleFilter, setTitleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchContents();
  }, [page, rowsPerPage, titleFilter, categoryFilter]);

  useEffect(() => {
    // Kategorileri yükle
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchContents = async () => {
    try {
      const params = { 
        page: page + 1, 
        limit: rowsPerPage,
        title: titleFilter,
        category: categoryFilter
      };
      const data = await getAllContents(params);
      setContents(data.contents);
      setTotalCount(data.totalDocuments);
    } catch (error) {
      console.error('Error fetching contents:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (content) => {
    navigate(`/content/${content._id}`);
  };

  const handleDelete = async (content) => {
    try {
      await deleteContent(content._id);
      fetchContents(); // İçerik silindikten sonra verileri yeniden yükleyin
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const handleFilterChange = () => {
    // Filtreleme işlemi
    setPage(0);
    fetchContents();
  };

  return (
    <Paper>
      {/* Filtreleme Satırı */}
      <Grid container spacing={2} alignItems="center" style={{ padding: 16 }}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Başlık Ara"
            variant="outlined"
            fullWidth
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Kategori Seç</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Kategori Seç"
            >
              <MenuItem value="">
                <em>Hepsi</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            onClick={handleFilterChange}
          >
            Filtrele
          </Button>
        </Grid>
      </Grid>

      {/* İçerik Listesi Tablosu */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlık</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Yazar</TableCell>
              <TableCell>Yayın Tarihi</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Güncelleme</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contents.map((content) => (
              <TableRow key={content._id}>
                <TableCell>{content.title}</TableCell>
                <TableCell>{content.categories.map(cat => cat.name).join(', ')}</TableCell>
                <TableCell>{content.author ? content.author.name : ''}</TableCell>
                <TableCell>{new Date(content.publishDate).toLocaleString()}</TableCell>
                <TableCell>{content.status}</TableCell>
                <TableCell>{new Date(content.updatedAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(content)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(content)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Sayfalama */}
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Paper>
  );
};

export default ContentList;
