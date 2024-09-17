import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, TablePagination, Grid, TextField, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllCelebrations, deleteCelebration } from '../../api'; // API fonksiyonlarını içe aktarın
import { useNavigate } from 'react-router-dom';

const CelebrationList = () => {
  const [celebrations, setCelebrations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [titleFilter, setTitleFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCelebrations();
  }, [page, rowsPerPage]);

  const fetchCelebrations = async () => {
    try {
      const params = { 
        page: page + 1, 
        limit: rowsPerPage,
        title: titleFilter,
      };
      const data = await getAllCelebrations(params);
      setCelebrations(data.celebrations);
      setTotalCount(data.totalDocuments);
    } catch (error) {
      console.error('Error fetching celebrations:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (celebration) => {
    navigate(`/celebration/${celebration._id}`);
  };

  const handleDelete = async (celebration) => {
    try {
      await deleteCelebration(celebration._id);
      fetchCelebrations(); // Kutlama silindikten sonra verileri yeniden yükleyin
    } catch (error) {
      console.error('Error deleting celebration:', error);
    }
  };

  const handleFilterChange = () => {
    // Filtreleme işlemi
    setPage(0);
    fetchCelebrations();
  };

  return (
    <Paper>
      {/* Filtreleme Satırı */}
      <Grid container spacing={2} alignItems="center" style={{ padding: 16 }}>
        <Grid item xs={12} md={8}>
          <TextField
            label="Başlık Ara"
            variant="outlined"
            fullWidth
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
          />
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

      {/* Kutlama Listesi Tablosu */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlık</TableCell>
              <TableCell>Olay Tarihi</TableCell>
              <TableCell>Dönem</TableCell>
              <TableCell>Yazar</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {celebrations.map((celebration) => (
              <TableRow key={celebration._id}>
                <TableCell>{celebration.title}</TableCell>
                <TableCell>{celebration.eventDate}</TableCell>
                <TableCell>{celebration.period ? celebration.period.name : ''}</TableCell>
                <TableCell>{celebration.createdBy ? celebration.createdBy.name : ''}</TableCell>
                <TableCell>{new Date(celebration.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(celebration)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(celebration)}>
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

export default CelebrationList;
