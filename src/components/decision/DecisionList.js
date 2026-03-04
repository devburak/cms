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
  deleteDecision,
  getAllPeriods,
  getDecisionCategories,
  getDecisions,
  getWorkGroups,
} from '../../api';
import { useAuth } from '../../context/AuthContext';

const DECISION_TYPES = [
  { value: '', label: 'Tümü' },
  { value: 'management-board', label: 'Yönetim Kurulu' },
  { value: 'audit-board', label: 'Denetleme Kurulu' },
  { value: 'honor-board', label: 'Onur Kurulu' },
  { value: 'work-group', label: 'Çalışma Grubu' },
];

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('tr-TR');
}

export default function DecisionList({ onEdit, onNotify, reloadKey = 0 }) {
  const { hasPermission } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [periods, setPeriods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [workGroups, setWorkGroups] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWorkGroup, setSelectedWorkGroup] = useState(null);
  const [decisionType, setDecisionType] = useState('');

  const fetchDecisions = useCallback(async () => {
    try {
      const result = await getDecisions({
        page,
        limit: 20,
        search: searchTerm,
        period: selectedPeriod,
        decisionCategory: selectedCategory?._id || '',
        workGroup: selectedWorkGroup?._id || '',
        decisionType: decisionType || '',
      });
      setDecisions(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      onNotify('Kararlar yüklenirken hata oluştu', 'error');
    }
  }, [decisionType, onNotify, page, searchTerm, selectedCategory, selectedPeriod, selectedWorkGroup]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions, reloadKey]);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [periodsData, categoriesData, workGroupsData] = await Promise.all([
          getAllPeriods(),
          getDecisionCategories(),
          getWorkGroups(),
        ]);
        setPeriods(periodsData.periods || []);
        setCategories(categoriesData || []);
        setWorkGroups(workGroupsData || []);
      } catch (error) {
        console.error('Error fetching decision filters:', error);
      }
    };

    fetchDependencies();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kararı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await deleteDecision(id);
      onNotify('Karar silindi');
      fetchDecisions();
    } catch (error) {
      onNotify('Karar silinirken hata oluştu', 'error');
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
            label="Dönem"
            value={selectedPeriod}
            onChange={(event) => setSelectedPeriod(event.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          >
            <MenuItem value="">Tümü</MenuItem>
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
              <TextField {...params} label="Karar Kategorisi" variant="outlined" size="small" />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            select
            label="Karar Tipi"
            value={decisionType}
            onChange={(event) => setDecisionType(event.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          >
            {DECISION_TYPES.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
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
              <TableCell>Başlık</TableCell>
              <TableCell>Tip</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Çalışma Grubu</TableCell>
              <TableCell>Dönem</TableCell>
              <TableCell>Toplantı Tarihi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {decisions.map((decision) => (
              <TableRow key={decision._id}>
                <TableCell>{decision.title}</TableCell>
                <TableCell>{DECISION_TYPES.find((item) => item.value === decision.decisionType)?.label || '-'}</TableCell>
                <TableCell>{decision.decisionCategory?.name || '-'}</TableCell>
                <TableCell>{decision.workGroup?.name || '-'}</TableCell>
                <TableCell>{decision.period?.name || '-'}</TableCell>
                <TableCell>{formatDate(decision.meetingDate || decision.publishDate)}</TableCell>
                <TableCell>
                  {hasPermission('updateDecision') ? (
                    <IconButton onClick={() => onEdit(decision)}>
                      <EditIcon />
                    </IconButton>
                  ) : null}
                  {hasPermission('deleteDecision') ? (
                    <IconButton onClick={() => handleDelete(decision._id)}>
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
