import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Select,
  MenuItem,
  Button,
  IconButton,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import 'moment/locale/tr';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {
  getForms,
  getSubmissions,
  exportSubmissionsFile,
  deleteFormSubmission,
  deleteFormSubmissions,
} from '../../api';
import { saveAs } from 'file-saver';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { notifySuccess } from '../../services/notificationBus';

export default function SubmissionList() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialFormId = searchParams.get('formId') || '';
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(initialFormId);
  const [submissions, setSubmissions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [exporting, setExporting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState(new Set());
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => { fetchForms(); }, []);

  useEffect(() => {
    const param = searchParams.get('formId');
    if (param) setSelectedForm(param);
  }, [searchParams]);

  useEffect(() => {
    if (selectedForm) fetchSubmissions();
  }, [selectedForm, page, searchQuery, sortOrder, startDate, endDate]);

  useEffect(() => {
    setSelectedSubmissionIds(new Set());
    setAllMatchingSelected(false);
  }, [selectedForm]);

  useEffect(() => {
    setAllMatchingSelected(false);
  }, [searchQuery, startDate, endDate]);

  const fetchForms = async () => {
    const data = await getForms({ page: 1, limit: 1000 });
    setForms(data.forms || []);
  };

  const getCurrentFilters = () => {
    const filters = {
      search: searchQuery || undefined,
    };

    if (startDate) {
      const dateObj = startDate.toDate ? startDate.toDate() : startDate;
      if (dateObj instanceof Date && !isNaN(dateObj)) {
        filters.startDate = dateObj.toISOString();
      }
    }
    if (endDate) {
      const dateObj = endDate.toDate ? endDate.toDate() : endDate;
      if (dateObj instanceof Date && !isNaN(dateObj)) {
        const endOfDay = new Date(dateObj);
        endOfDay.setHours(23, 59, 59, 999);
        filters.endDate = endOfDay.toISOString();
      }
    }

    return filters;
  };

  const fetchSubmissions = async () => {
    const params = {
      page,
      limit,
      ...getCurrentFilters(),
      sort: sortOrder === 'newest' ? '-createdAt' : 'createdAt',
    };

    const data = await getSubmissions(selectedForm, params);
    setSubmissions(data.submissions || []);
    setTotal(data.total || 0);
    setTotalPages(Math.ceil((data.total || 0) / limit));
  };

  const hiddenFields = ['createdBy', '__v', '_id', 'form'];

  const getHeaders = () =>
    submissions.length > 0
      ? Object.keys(submissions[0]).filter((h) => !hiddenFields.includes(h))
      : [];

  const handleExport = async (format) => {
    if (exporting) return;
    setExporting(true);
    setDownloadProgress(0);
    try {
      // Build filters object matching current view
      const filters = {
        ...getCurrentFilters(),
        sort: sortOrder === 'newest' ? '-createdAt' : 'createdAt',
      };

      const blob = await exportSubmissionsFile(
        selectedForm,
        format,
        (e) => {
          if (e.total) {
            setDownloadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
        filters,
      );
      saveAs(blob, `submissions.${format === 'xlsx' ? 'xlsx' : 'csv'}`);
    } catch (err) {
      console.error('Export error', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('Delete submission?'))) return;
    await deleteFormSubmission(selectedForm, id);
    setSelectedSubmissionIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    fetchSubmissions();
  };

  const visibleSubmissionIds = submissions.map((submission) => submission._id);
  const allVisibleSelected = visibleSubmissionIds.length > 0 && (
    allMatchingSelected || visibleSubmissionIds.every((id) => selectedSubmissionIds.has(id))
  );
  const someVisibleSelected = !allMatchingSelected && visibleSubmissionIds.some(
    (id) => selectedSubmissionIds.has(id)
  );
  const selectedCount = allMatchingSelected ? total : selectedSubmissionIds.size;

  const handleToggleSubmission = (id) => {
    if (allMatchingSelected) {
      setAllMatchingSelected(false);
      setSelectedSubmissionIds(new Set(visibleSubmissionIds.filter((visibleId) => visibleId !== id)));
      return;
    }

    setSelectedSubmissionIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleVisible = () => {
    if (allMatchingSelected) {
      setAllMatchingSelected(false);
      setSelectedSubmissionIds(new Set());
      return;
    }

    setSelectedSubmissionIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        visibleSubmissionIds.forEach((id) => next.delete(id));
      } else {
        visibleSubmissionIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSelectAllMatching = () => {
    setAllMatchingSelected(true);
    setSelectedSubmissionIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (!selectedCount || deleting) return;

    const confirmationMessage = t('Delete selected submissions?', { count: selectedCount });
    if (!window.confirm(confirmationMessage)) return;

    setDeleting(true);
    try {
      const payload = allMatchingSelected
        ? { allMatching: true, filters: getCurrentFilters() }
        : { submissionIds: Array.from(selectedSubmissionIds) };
      const result = await deleteFormSubmissions(selectedForm, payload);
      const deletedCount = result.deletedCount || 0;

      setSelectedSubmissionIds(new Set());
      setAllMatchingSelected(false);
      notifySuccess(t('Submissions deleted successfully', { count: deletedCount }));

      const remainingTotal = Math.max(0, total - deletedCount);
      const lastRemainingPage = Math.max(1, Math.ceil(remainingTotal / limit));
      if (page > lastRemainingPage) {
        setPage(lastRemainingPage);
      } else {
        await fetchSubmissions();
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setSortOrder('newest');
    setPage(1);
    setSelectedSubmissionIds(new Set());
    setAllMatchingSelected(false);
  };

  const renderCell = (key, value) => {
    if (key === 'data' && typeof value === 'object' && value !== null) {
      const entries = Object.entries(value).slice(0, 3).map(([k, v]) => `${k}: ${v}`);
      const suffix = Object.keys(value).length > 3 ? ', ...' : '';
      return entries.join(', ') + suffix;
    }
    if (key === 'createdAt' || key === 'submittedAt' || key === 'updatedAt') {
      return value ? new Date(value).toLocaleString('tr-TR') : '';
    }
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return String(value);
  };

  const showActions =
    hasPermission('updateFormSubmission') ||
    hasPermission('deleteFormSubmission');

  const hasActiveFilters = searchQuery || startDate || endDate || sortOrder !== 'newest';

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
      <Box>
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Select
              size="small"
              fullWidth
              value={selectedForm}
              onChange={(e) => {
                setSelectedForm(e.target.value);
                setPage(1);
                setSearchQuery('');
                setStartDate(null);
                setEndDate(null);
              }}
              displayEmpty
            >
              <MenuItem value="">{t('Select Form')}</MenuItem>
              {forms.map(f => (<MenuItem key={f._id} value={f._id}>{f.name}</MenuItem>))}
            </Select>
          </Grid>
          {selectedForm && (
            <>
              <Grid item xs={6} md={3}>
                <Button onClick={() => handleExport('csv')} fullWidth variant="outlined" disabled={exporting}>
                  {t('Export CSV')}
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button onClick={() => handleExport('xlsx')} fullWidth variant="outlined" disabled={exporting}>
                  {t('Export XLSX')}
                </Button>
              </Grid>
            </>
          )}
        </Grid>

        {selectedForm && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={t('Search in submissions...')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label={t('Start Date')}
                  value={startDate}
                  onChange={(newValue) => {
                    setStartDate(newValue);
                    setPage(1);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label={t('End Date')}
                  value={endDate}
                  onChange={(newValue) => {
                    setEndDate(newValue);
                    setPage(1);
                  }}
                  minDate={startDate}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>{t('Sort by Date')}</InputLabel>
                  <Select
                    value={sortOrder}
                    label={t('Sort by Date')}
                    onChange={(e) => {
                      setSortOrder(e.target.value);
                      setPage(1);
                    }}
                  >
                    <MenuItem value="newest">{t('Newest First')}</MenuItem>
                    <MenuItem value="oldest">{t('Oldest First')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {hasActiveFilters && (
                <Grid item xs={12}>
                  <Button
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    size="small"
                    variant="outlined"
                  >
                    {t('Clear Filters')}
                  </Button>
                </Grid>
              )}
            </Grid>

            <TableContainer>
              {hasPermission('deleteFormSubmission') && total > 0 && selectedCount === 0 && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<SelectAllIcon />}
                    onClick={handleSelectAllMatching}
                  >
                    {t('Select all matching submissions', { count: total })}
                  </Button>
                </Box>
              )}
              {hasPermission('deleteFormSubmission') && selectedCount > 0 && (
                <Alert
                  severity="info"
                  sx={{ mb: 2 }}
                  action={(
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!allMatchingSelected && selectedCount < total && (
                        <Button
                          color="inherit"
                          size="small"
                          onClick={handleSelectAllMatching}
                        >
                          {t('Select all matching submissions', { count: total })}
                        </Button>
                      )}
                      <Button
                        color="error"
                        variant="contained"
                        size="small"
                        startIcon={<DeleteIcon />}
                        disabled={deleting}
                        onClick={handleBulkDelete}
                      >
                        {t('Delete selected', { count: selectedCount })}
                      </Button>
                    </Box>
                  )}
                >
                  {allMatchingSelected
                    ? t('All matching submissions selected', { count: total })
                    : t('Selected submissions', { count: selectedCount })}
                </Alert>
              )}
              <Table>
                <TableHead>
                  <TableRow>
                    {hasPermission('deleteFormSubmission') && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={allVisibleSelected}
                          indeterminate={someVisibleSelected && !allVisibleSelected}
                          onChange={handleToggleVisible}
                          inputProps={{ 'aria-label': t('Select submissions on this page') }}
                        />
                      </TableCell>
                    )}
                    {getHeaders().map(key => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                    {showActions && <TableCell>{t('Actions')}</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((sub, idx) => (
                    <TableRow
                      key={sub._id || idx}
                      selected={allMatchingSelected || selectedSubmissionIds.has(sub._id)}
                    >
                      {hasPermission('deleteFormSubmission') && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={allMatchingSelected || selectedSubmissionIds.has(sub._id)}
                            onChange={() => handleToggleSubmission(sub._id)}
                            inputProps={{ 'aria-label': t('Select submission') }}
                          />
                        </TableCell>
                      )}
                      {getHeaders().map(k => (
                        <TableCell key={k}>{renderCell(k, sub[k])}</TableCell>
                      ))}
                      {showActions && (
                        <TableCell>
                          {hasPermission('updateFormSubmission') && (
                            <IconButton onClick={() => navigate(`/form/${selectedForm}/fill/${sub._id}`)}>
                              <EditIcon />
                            </IconButton>
                          )}
                          {hasPermission('deleteFormSubmission') && (
                            <IconButton
                              onClick={() => handleDelete(sub._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                {t('Showing')} {submissions.length} {t('of')} {total} {t('submissions')}
              </Box>
              <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} />
            </Box>
          </>
        )}
        <Dialog open={exporting}>
          <DialogTitle>{t('Exporting...')}</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 200 }}>
              <LinearProgress
                variant={downloadProgress ? 'determinate' : 'indeterminate'}
                value={downloadProgress}
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
