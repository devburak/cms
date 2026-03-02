import React, { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { deleteContent, getAllCategories, getAllContents, getContentFilterOptions } from '../../api';
import { useNavigate } from 'react-router-dom';

const createInitialFilters = () => ({
  title: '',
  category: null,
  slug: '',
  periodId: '',
  status: '',
  authorId: '',
  publishStartDate: null,
  publishEndDate: null,
  updatedStartDate: null,
  updatedEndDate: null
});

const formatDateForQuery = (value) => {
  if (!value || typeof value.format !== 'function') {
    return '';
  }

  return value.format('YYYY-MM-DD');
};

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleString('tr-TR');
};

const normalizeSearchText = (value) =>
  String(value || '')
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .trim();

const buildLoadErrorState = (error) => {
  if (error?.response?.status === 403) {
    return {
      title: 'Bu listeyi görüntüleme yetkiniz yok.',
      type: 'warning'
    };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return {
      title: 'Bağlantı görünmüyor. İnternetinizi kontrol edip tekrar deneyin.',
      type: 'error'
    };
  }

  return {
    title: 'Sayfalar yüklenirken bir sorun oluştu. Tekrar deneyin.',
    type: 'error'
  };
};

const hasActiveAdvancedFilters = (filters) =>
  Boolean(
    filters.slug ||
      filters.periodId ||
      filters.status ||
      filters.authorId ||
      filters.publishStartDate ||
      filters.publishEndDate ||
      filters.updatedStartDate ||
      filters.updatedEndDate
  );

const getAdvancedFilterCount = (filters) =>
  [
    filters.slug,
    filters.periodId,
    filters.status,
    filters.authorId,
    filters.publishStartDate,
    filters.publishEndDate,
    filters.updatedStartDate,
    filters.updatedEndDate
  ].filter(Boolean).length;

const getCategoryLabel = (category, categories, depth = 0) => {
  if (!category) {
    return '';
  }

  const currentName = category.name || '';
  const parentRef = typeof category.parent === 'object' ? category.parent?._id : category.parent;

  if (!parentRef || depth > 8) {
    return currentName;
  }

  const parent =
    categories.find((item) => String(item._id) === String(parentRef)) ||
    (typeof category.parent === 'object' ? category.parent : null);

  if (!parent) {
    return currentName;
  }

  const parentLabel = getCategoryLabel(parent, categories, depth + 1);
  return parentLabel ? `${parentLabel} / ${currentName}` : currentName;
};

const getStatusChipProps = (status) => {
  if (status === 'published') {
    return { label: 'Yayında', color: 'success' };
  }

  if (status === 'archived') {
    return { label: 'Arşiv', color: 'default' };
  }

  return { label: 'Taslak', color: 'warning' };
};

const filterCategoryOptions = createFilterOptions({
  stringify: (option) =>
    normalizeSearchText([option?.name, option?.slug].filter(Boolean).join(' '))
});

const ContentList = () => {
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState(createInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState(createInitialFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetaLoading, setIsMetaLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const navigate = useNavigate();

  const fetchContents = async (nextPage = page, nextRowsPerPage = rowsPerPage, nextFilters = appliedFilters) => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const params = {
        page: nextPage + 1,
        limit: nextRowsPerPage,
        title: nextFilters.title.trim(),
        category: nextFilters.category?._id || '',
        slug: nextFilters.slug.trim().replace(/^\/+|\/+$/g, ''),
        periodId: nextFilters.periodId,
        status: nextFilters.status,
        author: nextFilters.authorId,
        publishStartDate: formatDateForQuery(nextFilters.publishStartDate),
        publishEndDate: formatDateForQuery(nextFilters.publishEndDate),
        updatedStartDate: formatDateForQuery(nextFilters.updatedStartDate),
        updatedEndDate: formatDateForQuery(nextFilters.updatedEndDate),
        sortField: 'publishDate',
        sortOrder: 'desc'
      };

      const data = await getAllContents(params);
      setContents(data.contents || []);
      setTotalCount(data.totalDocuments || 0);
    } catch (error) {
      console.error('Error fetching contents:', error);
      setLoadError(buildLoadErrorState(error));
      setContents([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContents(page, rowsPerPage, appliedFilters);
  }, [page, rowsPerPage, appliedFilters]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsMetaLoading(true);

      try {
        const [filterOptionsResult, categoriesResult] = await Promise.allSettled([
          getContentFilterOptions(),
          getAllCategories()
        ]);

        if (filterOptionsResult.status === 'fulfilled') {
          const data = filterOptionsResult.value || {};
          setPeriods(Array.isArray(data.periods) ? data.periods : []);
          setAuthors(Array.isArray(data.authors) ? data.authors : []);

          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
        } else {
          console.error('Error fetching content filter options:', filterOptionsResult.reason);
        }

        if (categoriesResult.status === 'fulfilled') {
          const fallbackCategories = Array.isArray(categoriesResult.value) ? categoriesResult.value : [];
          setCategories((prev) => (prev.length > 0 ? prev : fallbackCategories));
        } else {
          console.error('Error fetching categories fallback:', categoriesResult.reason);
        }
      } finally {
        setIsMetaLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const nextRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(nextRowsPerPage);
    setPage(0);
  };

  const handleEdit = (content) => {
    navigate(`/content/${content._id}`);
  };

  const handleDelete = async (content) => {
    if (!window.confirm(`"${content.title}" başlıklı sayfa silinsin mi?`)) {
      return;
    }

    try {
      await deleteContent(content._id);
      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      setLoadError({
        title: 'Sayfa silinemedi. Tekrar deneyin.',
        type: 'error'
      });
    }
  };

  const handleApplyFilters = (event) => {
    if (event) {
      event.preventDefault();
    }

    setPage(0);
    setAppliedFilters({ ...filters });
  };

  const handleClearFilters = () => {
    const nextFilters = createInitialFilters();
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(0);
    setShowAdvancedFilters(false);
  };

  const advancedFilterCount = getAdvancedFilterCount(filters);
  const emptyMessage =
    page > 0
      ? 'Bu sayfada kayıt bulunamadı.'
      : appliedFilters.title || appliedFilters.category || hasActiveAdvancedFilters(appliedFilters)
        ? 'Seçili filtrelerle eşleşen sayfa bulunamadı.'
        : 'Henüz içerik bulunmuyor.';

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
      <Paper sx={{ overflow: 'hidden' }}>
        <Box
          component="form"
          onSubmit={handleApplyFilters}
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 2.5 },
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(
                theme.palette.background.paper,
                0.98
              )} 100%)`
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.2 }}>
                Sayfa Filtreleri
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Başlık ve kategori ile hızlı arama yapın
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detay filtrelerini gerektiğinde açıp yayın, dönem ve slug üzerinden daha dar sonuç alın.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
              <Chip
                color="primary"
                variant="filled"
                label={isLoading ? 'Icerik sayisi guncelleniyor' : `${totalCount} icerik`}
              />
              {advancedFilterCount > 0 && (
                <Chip
                  color="primary"
                  variant="outlined"
                  label={`${advancedFilterCount} detay filtresi secildi`}
                />
              )}
            </Stack>
          </Stack>

          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} md={5}>
              <TextField
                label="Başlık"
                placeholder="Başlıkta ara"
                variant="outlined"
                fullWidth
                size="small"
                value={filters.title}
                onChange={(event) => setFilters((prev) => ({ ...prev, title: event.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                options={categories}
                loading={isMetaLoading}
                value={filters.category}
                onChange={(event, value) => setFilters((prev) => ({ ...prev, category: value }))}
                isOptionEqualToValue={(option, value) => String(option._id) === String(value?._id)}
                getOptionLabel={(option) => getCategoryLabel(option, categories)}
                filterOptions={(options, state) => {
                  const filtered = filterCategoryOptions(options, state);
                  const query = normalizeSearchText(state.inputValue);

                  if (!query) {
                    return filtered;
                  }

                  return filtered.filter((option) => {
                    const label = normalizeSearchText(getCategoryLabel(option, categories));
                    const slug = normalizeSearchText(option?.slug);
                    return label.includes(query) || slug.includes(query);
                  });
                }}
                noOptionsText="Kategori bulunamadı"
                loadingText="Kategoriler yükleniyor"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Kategori"
                    placeholder="Yazarak kategori seçin"
                    size="small"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SearchIcon />}
                  disabled={isLoading}
                  fullWidth
                >
                  Filtrele
                </Button>

                <Stack direction="row" spacing={1}>
                  <Button
                    type="button"
                    variant="outlined"
                    color="inherit"
                    startIcon={<RestartAltIcon />}
                    onClick={handleClearFilters}
                    fullWidth
                  >
                    Temizle
                  </Button>
                  <Button
                    type="button"
                    variant={showAdvancedFilters ? 'contained' : 'outlined'}
                    color={showAdvancedFilters ? 'secondary' : 'inherit'}
                    startIcon={<TuneIcon />}
                    endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setShowAdvancedFilters((prev) => !prev)}
                    fullWidth
                  >
                    Detay
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          <Collapse in={showAdvancedFilters} timeout="auto" unmountOnExit>
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6)
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Slug"
                    placeholder="tam-eslesen-slug"
                    helperText="Tam eşleşme ile çalışır"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={filters.slug}
                    onChange={(event) => setFilters((prev) => ({ ...prev, slug: event.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={periods}
                    loading={isMetaLoading}
                    value={periods.find((period) => String(period._id) === String(filters.periodId)) || null}
                    onChange={(event, value) =>
                      setFilters((prev) => ({ ...prev, periodId: value?._id || '' }))
                    }
                    isOptionEqualToValue={(option, value) => String(option._id) === String(value?._id)}
                    getOptionLabel={(option) => option?.name || ''}
                    noOptionsText="Dönem bulunamadı"
                    loadingText="Dönemler yükleniyor"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Dönem"
                        placeholder="Dönem seçin"
                        size="small"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={authors}
                    loading={isMetaLoading}
                    value={authors.find((author) => String(author._id) === String(filters.authorId)) || null}
                    onChange={(event, value) =>
                      setFilters((prev) => ({ ...prev, authorId: value?._id || '' }))
                    }
                    isOptionEqualToValue={(option, value) => String(option._id) === String(value?._id)}
                    getOptionLabel={(option) => option?.name || option?.email || ''}
                    noOptionsText="Kullanıcı bulunamadı"
                    loadingText="Kullanıcılar yükleniyor"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Yayınlayan"
                        placeholder="Kullanıcı seçin"
                        size="small"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    label="Yayın Durumu"
                    value={filters.status}
                    onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="">Hepsi</MenuItem>
                    <MenuItem value="draft">Taslak</MenuItem>
                    <MenuItem value="published">Yayında</MenuItem>
                    <MenuItem value="archived">Arşiv</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Yayın Tarihi Başlangıç"
                    value={filters.publishStartDate}
                    onChange={(value) => setFilters((prev) => ({ ...prev, publishStartDate: value }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Yayın Tarihi Bitiş"
                    value={filters.publishEndDate}
                    onChange={(value) => setFilters((prev) => ({ ...prev, publishEndDate: value }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Güncellenme Başlangıç"
                    value={filters.updatedStartDate}
                    onChange={(value) => setFilters((prev) => ({ ...prev, updatedStartDate: value }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Güncellenme Bitiş"
                    value={filters.updatedEndDate}
                    onChange={(value) => setFilters((prev) => ({ ...prev, updatedEndDate: value }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Box>

        {isLoading && <LinearProgress />}

        {loadError && (
          <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
            <Alert
              severity={loadError.type}
              action={
                <Button color="inherit" size="small" onClick={() => fetchContents()}>
                  Yeniden Dene
                </Button>
              }
            >
              {loadError.title}
            </Alert>
          </Box>
        )}

        <TableContainer>
          <Table sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Dönem</TableCell>
                <TableCell>Yayınlayan</TableCell>
                <TableCell>Yayın Tarihi</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Güncelleme</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading && contents.length === 0
                  ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`content-loading-${index}`}>
                      <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="45%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="55%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="65%" /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={84} height={28} /></TableCell>
                      <TableCell><Skeleton variant="text" width="65%" /></TableCell>
                      <TableCell align="right"><Skeleton variant="rounded" width={72} height={32} /></TableCell>
                    </TableRow>
                  ))
                : null}

              {!isLoading &&
                contents.map((content) => {
                  const statusChip = getStatusChipProps(content.status);

                  return (
                    <TableRow key={content._id} hover>
                      <TableCell sx={{ minWidth: 220 }}>
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 600 }}>{content.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {content._id}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {Array.isArray(content.categories) && content.categories.length > 0
                          ? content.categories.map((category) => category.name).join(', ')
                          : '-'}
                      </TableCell>
                      <TableCell>{content.period?.name || '-'}</TableCell>
                      <TableCell>{content.author?.name || '-'}</TableCell>
                      <TableCell>{formatDateTime(content.publishDate)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={statusChip.color}
                          label={statusChip.label}
                          variant={content.status === 'archived' ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell>{formatDateTime(content.updatedAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Düzenle">
                          <IconButton onClick={() => handleEdit(content)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton color="error" onClick={() => handleDelete(content)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!isLoading && contents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6 }}>
                    <Stack spacing={1} alignItems="center">
                      <Typography variant="h6">Sonuç bulunamadı</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {emptyMessage}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Sayfa başına kayıt"
        />
      </Paper>
    </LocalizationProvider>
  );
};

export default ContentList;
