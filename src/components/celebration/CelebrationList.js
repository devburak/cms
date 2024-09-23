import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,Autocomplete, Tooltip, TablePagination, Grid, TextField, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllCelebrations, deleteCelebration ,getAllPeriods} from '../../api'; // API fonksiyonlarını içe aktarın
import { useNavigate } from 'react-router-dom';

const CelebrationList = () => {
  const [celebrations, setCelebrations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [titleFilter, setTitleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState(null);
  const [periods, setPeriods] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPeriods(); // Dönemleri çekmek için
    fetchCelebrations();
  }, [page, rowsPerPage]);

  const fetchPeriods = async () => {
    try {
      const data = await getAllPeriods();
      setPeriods(data.periods || []);
    } catch (error) {
      setPeriods([]); // Hata durumunda da periods'u boş dizi olarak ayarla
      console.error('Error fetching periods:', error);
    }
  };

  const fetchCelebrations = async () => {
    try {
      const params = { 
        page: page + 1, 
        limit: rowsPerPage,
        title: titleFilter,
        type: typeFilter,
        period: periodFilter ? periodFilter._id : '', // Period ID'yi kullanıyoruz
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange(); // Enter'a basıldığında filtreleme yap
    }
  };

  return (
    <Paper>
      {/* Filtreleme Satırı */}
      <Grid container spacing={2} alignItems="center" style={{ padding: 16 }}>
        <Grid item xs={12} sm={3}>
        <TextField
            label="Başlık Ara"
            variant="outlined"
            fullWidth
            size='small'
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            onKeyPress={handleKeyPress} // Enter'a basıldığında filtreleme
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Autocomplete
            options={periods}
            size='small'
            getOptionLabel={(option) => {
              const startDateFormatted = option.startDate ? new Date(option.startDate).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }) : '';
              
              const endDateFormatted = option.endDate ? new Date(option.endDate).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }) : '';
            
              return option?.name ? `${option.name} (${startDateFormatted} - ${endDateFormatted})` : '';
            }}
            // value={periods.find(p => p._id === periodFilter.period?._id) || null}
            value={periodFilter}
            onChange={(event, newValue) => setPeriodFilter(newValue)}
            renderInput={(params) => <TextField {...params} label="Dönem Seç" variant="outlined" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth variant="outlined" size='small'>
            <InputLabel>Tür Seç</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Tür Seç"
            >
              <MenuItem value="">Hepsi</MenuItem>
              <MenuItem value="dunya">DÜNYADA</MenuItem>
              <MenuItem value="turkiye">TÜRKİYE'DE</MenuItem>
              <MenuItem value="tmmob">TMMOB'DE</MenuItem>
              <MenuItem value="yayin">YAYINLAR</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
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
              <TableCell>Dönem</TableCell>
              <TableCell>Tip</TableCell>
              <TableCell>Başlık</TableCell>
              <TableCell>Olay Tarihi</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {celebrations.map((celebration) => (
              <TableRow key={celebration._id}>
                 <TableCell>{celebration.period ? celebration.period.name : ''}</TableCell>
                 <TableCell>{celebration.type ?  celebration.type : ''}</TableCell>
                <TableCell>{celebration.title}</TableCell>
                <TableCell>{celebration.eventDate}</TableCell>
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
