import React, { useCallback, useEffect, useState } from 'react';
import {
  Autocomplete,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  deleteReport,
  getAllPeriods,
  getReportCategories,
  getReports,
  getWorkGroups,
} from '../../api';
import { useAuth } from '../../context/AuthContext';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('tr-TR');
}

export default function ReportList({ onEdit, onNotify, reloadKey = 0 }) {
  const { hasPermission } = useAuth();
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [periods, setPeriods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [workGroups, setWorkGroups] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWorkGroup, setSelectedWorkGroup] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      const result = await getReports({
        page,
        limit: 20,
        search: searchTerm,
        period: selectedPeriod,
        reportCategory: selectedCategory?._id || '',
        workGroup: selectedWorkGroup?._id || '',
      });
      setReports(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      onNotify('Raporlar yuklenirken hata olustu', 'error');
    }
  }, [onNotify, page, searchTerm, selectedCategory, selectedPeriod, selectedWorkGroup]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, reloadKey]);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [periodsData, categoriesData, workGroupsData] = await Promise.all([
          getAllPeriods(),
          getReportCategories(),
          getWorkGroups(),
        ]);
        setPeriods(periodsData.periods || []);
        setCategories(categoriesData || []);
        setWorkGroups(workGroupsData || []);
      } catch (error) {
        console.error('Error fetching report filters:', error);
      }
    };

    fetchDependencies();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu raporu silmek istediginize emin misiniz?')) {
      return;
    }

    try {
      await deleteReport(id);
      onNotify('Rapor silindi');
      fetchReports();
    } catch (error) {
      onNotify('Rapor silinirken hata olustu', 'error');
    }
  };

  return (
    <Paper>
      <Grid container spacing={2} alignItems="center" sx={{ p: 2 }}>
        <Grid item xs={12} md={3}>
          <TextField
            label="Ara"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            select
            label="Donem"
            value={selectedPeriod}
            onChange={(event) => setSelectedPeriod(event.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          >
            <MenuItem value="">Tumu</MenuItem>
            {periods.map((period) => (
              <MenuItem key={period._id} value={period._id}>
                {period.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.name || ''}
            value={selectedCategory}
            onChange={(event, newValue) => setSelectedCategory(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Rapor Kategorisi" variant="outlined" size="small" />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Autocomplete
            options={workGroups}
            getOptionLabel={(option) =>
              `${option.name || ''}${option.period?.name ? ` (${option.period.name})` : ''}`
            }
            value={selectedWorkGroup}
            onChange={(event, newValue) => setSelectedWorkGroup(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Çalışma Grubu" variant="outlined" size="small" />
            )}
          />
        </Grid>
      </Grid>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Baslik</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Donem</TableCell>
              <TableCell>Çalışma Grubu</TableCell>
              <TableCell>Toplanti Tarihi</TableCell>
              <TableCell>Toplanti Yeri</TableCell>
              <TableCell>Islemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>{report.title}</TableCell>
                <TableCell>{report.reportCategory?.name || '-'}</TableCell>
                <TableCell>{report.period?.name || '-'}</TableCell>
                <TableCell>{report.workGroup?.name || '-'}</TableCell>
                <TableCell>{formatDate(report.meetingDate || report.publishDate)}</TableCell>
                <TableCell>{report.meetingLocation || '-'}</TableCell>
                <TableCell>
                  {hasPermission('updateReport') ? (
                    <IconButton onClick={() => onEdit(report)}>
                      <EditIcon />
                    </IconButton>
                  ) : null}
                  {hasPermission('deleteReport') ? (
                    <IconButton onClick={() => handleDelete(report._id)}>
                      <DeleteIcon />
                    </IconButton>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(event, value) => setPage(value)}
        sx={{ my: 2, display: 'flex', justifyContent: 'center' }}
      />
    </Paper>
  );
}
