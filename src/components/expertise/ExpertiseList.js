import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Pagination, CircularProgress, IconButton,
  TextField, Select, MenuItem, FormControl, InputLabel, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getExpertises, deleteExpertise, getAllChambers } from '../../api';
import moment from 'moment';

const ExpertiseList = ({ onEdit }) => {
  const [expertises, setExpertises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [filterChamber, setFilterChamber] = useState('');
  const [chambers, setChambers] = useState([]);

  const fetchExpertises = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        ...(filterType && { type: filterType }),
        ...(filterChamber && { chamber: filterChamber }),
      };
      const data = await getExpertises(params);
      setExpertises(Array.isArray(data?.data) ? data.data : []);
      setTotalCount(data?.totalCount || 0);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch expertises.');
      setLoading(false);
      console.error('Error fetching expertises:', err);
    }
  };

  const fetchChambers = async () => {
    try {
      const data = await getAllChambers();
      setChambers(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error fetching chambers for filter:', err);
      setChambers([]);
    }
  };

  useEffect(() => {
    fetchChambers();
  }, []);

  useEffect(() => {
    fetchExpertises();
  }, [page, limit, filterType, filterChamber]);

  const handleDelete = async (id) => {
    if (window.confirm('Bu bilirkişilik eğitimini silmek istediğinizden emin misiniz?')) {
      setLoading(true);
      setError(null);
      try {
        await deleteExpertise(id);
        fetchExpertises();
      } catch (err) {
        setError('Failed to delete expertise.');
        setLoading(false);
        console.error('Error deleting expertise:', err);
      }
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
    setPage(1);
  };

  const handleFilterChamberChange = (event) => {
    setFilterChamber(event.target.value);
    setPage(1);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Bilirkişilik Eğitimleri
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
           <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Eğitim Türü</InputLabel>
            <Select
              value={filterType}
              label="Eğitim Türü"
              onChange={handleFilterTypeChange}
            >
              <MenuItem value=""><em>Tümü</em></MenuItem>
              <MenuItem value="Temel Eğitim">Temel Eğitim</MenuItem>
              <MenuItem value="Yenileme Eğitimi">Yenileme Eğitimi</MenuItem>
            </Select>
          </FormControl>
           <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Oda</InputLabel>
            <Select
              value={filterChamber}
              label="Oda"
              onChange={handleFilterChamberChange}
            >
              <MenuItem value=""><em>Tümü</em></MenuItem>
               {(Array.isArray(chambers) ? chambers : []).map((chamber) => (
                <MenuItem key={chamber._id} value={chamber._id}>
                  {chamber.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tür</TableCell>
                  <TableCell>Oda</TableCell>
                  <TableCell>Başlangıç</TableCell>
                  <TableCell>Bitiş</TableCell>
                  <TableCell>Adres</TableCell>
                  <TableCell>İletişim E-posta</TableCell>
                  <TableCell>Başvuru Linki</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(Array.isArray(expertises) ? expertises : []).map((expertise) => (
                  <TableRow key={expertise._id}>
                    <TableCell>{expertise.type}</TableCell>
                    <TableCell>{expertise.chamber?.name || 'N/A'}</TableCell>
                    <TableCell>{expertise.startDate ? moment(expertise.startDate).format('DD.MM.YYYY HH:mm') : '-'}</TableCell>
                    <TableCell>{expertise.endDate ? moment(expertise.endDate).format('DD.MM.YYYY HH:mm') : '-'}</TableCell>
                    <TableCell>{expertise.location?.address || '-'}</TableCell>
                    <TableCell>{expertise.contact?.email || '-'}</TableCell>
                    <TableCell>{expertise.application?.link || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => onEdit(expertise._id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(expertise._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(totalCount / limit)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="small"
            />
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ExpertiseList;
