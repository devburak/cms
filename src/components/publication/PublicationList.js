// components/publication/PublicationList.js
import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Pagination, TextField, MenuItem, Autocomplete } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getPublications, deletePublication, getAllPeriods, getAllCategories } from '../../api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

const PublicationList = ({ onEdit, onNotify }) => {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const [publications, setPublications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [periods, setPeriods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchPublications = useCallback(async () => {
    try {
      const result = await getPublications({ page, limit: 20, search: searchTerm, period: selectedPeriod, category: selectedCategory?._id || '', startDate, endDate });
      setPublications(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      onNotify(t('errorLoadingPublications'), 'error');
    }
  }, [page, searchTerm, selectedPeriod, selectedCategory, startDate, endDate, t]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  useEffect(() => {
    const fetchPeriodsAndCategories = async () => {
      try {
        const periodsData = await getAllPeriods();
        setPeriods(periodsData.periods || []);
        const categoriesData = await getAllCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching periods or categories:', error);
      }
    };
    fetchPeriodsAndCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDeletePublication'))) {
      try {
        await deletePublication(id);
        onNotify(t('publicationDeleted'));
        fetchPublications();
      } catch (error) {
        onNotify(t('errorDeletingPublication'), 'error');
      }
    }
  };

  return (
    <Paper>
      <Grid container spacing={2} alignItems="center" style={{ padding: '16px' }}>
        <Grid item xs={6} sm={4}>
          <TextField 
            label={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            select
            label={t('Period')}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          >
            <MenuItem value="">{t('All')}</MenuItem>
            {periods.map((period) => (
              <MenuItem key={period._id} value={period._id}>
                {period.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.name}
            value={selectedCategory}
            onChange={(event, newValue) => setSelectedCategory(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label={t('Category')}
                placeholder={t('Category')}
                size="small"
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
            <DatePicker
             slotProps={{ textField: { size: 'small' ,fullWidth:true} }}
              label={t('Start Date')}
              value={startDate}
              onChange={(date) => setStartDate(date)}
              renderInput={(params) => <TextField {...params} variant="outlined" size="small" fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={6} sm={6}>
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
            <DatePicker
             slotProps={{ textField: { size: 'small' ,fullWidth:true} }}
              label={t('End Date')}
              value={endDate}
              onChange={(date) => setEndDate(date)}
              renderInput={(params) => <TextField {...params} variant="outlined" size="small" fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('title')}</TableCell>
              <TableCell>{t('period')}</TableCell>
              <TableCell>{t('categories')}</TableCell>
              <TableCell>{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {publications.map((pub) => (
              <TableRow key={pub._id}>
                <TableCell>{pub.title}</TableCell>
                <TableCell>{pub.period ? pub.period.name : t('noPeriod')}</TableCell>
                <TableCell>{pub?.categories?.map(x => x.name).join(', ') || '-'}</TableCell>
                <TableCell>
                  {hasPermission('updatePublication') && (
                    <IconButton onClick={() => onEdit(pub)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  {hasPermission('deletePublication') && (
                    <IconButton onClick={() => handleDelete(pub._id)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination 
        count={totalPages} 
        page={page} 
        onChange={(e, value) => setPage(value)}
        sx={{ margin: '16px auto', display: 'flex', justifyContent: 'center' }}
      />
    </Paper>
  );
};

export default PublicationList;