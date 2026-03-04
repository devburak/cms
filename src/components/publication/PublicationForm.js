import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { createPublication, updatePublication, getAllPeriods, getAllCategories } from '../../api'; // Import getAllCategories
import FeaturedImage from '../file/featuredImage';
import FileViewer from '../file/fileviewer'; // Dosyaları gösteren bileşen
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Stack } from '@mui/material';
import moment from 'moment';
import 'moment/locale/tr';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const EMPTY_FILE_ROW = { _id: undefined, label: '', link: '', type: '' };

const createInitialFormData = () => ({
  title: '',
  bodyText: '',
  coverFile: null,
  files: [{ ...EMPTY_FILE_ROW }],
  period: null,
  categories: [],
  publishDate: moment()
});

const FileInsertModal = ({ open, onClose, onInsert }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{t('Select File')}</DialogTitle>
      <DialogContent>
        <FileViewer
          onFileSelect={(file) => setSelectedFile(file)}
          onUpload={() => {
          }}
          funcButton={{ onClick: () => {}, text: t('Upload File') }}
          multiSelect={false}
          showInfoButton={false}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => {
            if (selectedFile) {
              onInsert(selectedFile);
            }
          }}
          variant="contained"
          color="primary"
          disabled={!selectedFile}
        >
          {t('Insert')}
        </Button>
        <Button onClick={onClose} variant="outlined">
          {t('Cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PublicationForm = ({ publication, onSuccess, onError }) => {
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periods, setPeriods] = useState([]); // Dönemler için
  const [categories, setCategories] = useState([]); // Kategoriler için
  const [selectedCategories, setSelectedCategories] = useState([]); // Seçilen kategoriler
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(null);
  const [publishDate, setPublishDate] = useState(moment()); // Yayın tarihi için
  const dateLocale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const pickerLocale = i18n.language === 'tr' ? 'tr' : 'en';

  const [formData, setFormData] = useState(createInitialFormData);

  useEffect(() => {
    fetchPeriods();
    fetchCategories();
    if (publication) {
      setFormData({
        ...createInitialFormData(),
        title: publication.title || '',
        bodyText: publication.bodyText || '',
        coverFile: publication.coverFile || null,
        files: publication.files && publication.files.length > 0 ? publication.files : [{ ...EMPTY_FILE_ROW }],
        period: publication?.period || null,
        categories: publication.categories || []
      });
      setSelectedCategories(publication.categories || []); // Seçilen kategorileri ayarla
      setPublishDate(publication.publishDate ? moment(publication.publishDate) : moment());
      return;
    }
    setFormData(createInitialFormData());
    setSelectedCategories([]);
    setPublishDate(moment());
  }, [publication]);

  const fetchPeriods = async () => {
    try {
      const periodsData = await getAllPeriods();
      setPeriods(periodsData.periods || []); // Eğer boşsa, boş dizi ayarla
    } catch (error) {
      console.error('Error fetching periods:', error);
      setPeriods([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData || []); // Eğer boşsa, boş dizi ayarla
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoverFileSelect = (file) => {
    setFormData(prev => ({ ...prev, coverFile: file }));
  };

  const handlePeriodChange = (event, selectedPeriod) => {
    setFormData(prev => ({ ...prev, period: selectedPeriod || null }));
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategories(newValue);
  };

  // --- FILE INSERT İŞLEMLERİ ---
  // Label alanındaki değişiklikleri güncelleme
  const handleFileFieldChange = (index, field, value) => {
    const newFiles = [...formData.files];
    newFiles[index] = {
      ...newFiles[index],
      [field]: value,
    };
    setFormData(prev => ({ ...prev, files: newFiles }));
  };

  // Link alanına tıklandığında ilgili index için modal açılır.
  const openFileModal = (index) => {
    setActiveFileIndex(index);
    setFileModalOpen(true);
  };

  // Modal'dan dosya seçildiğinde ilgili satır güncellenir.
  const handleFileInsert = (fileData) => {
    if (activeFileIndex === null) return;
    const newFiles = [...formData.files];
    newFiles[activeFileIndex] = {
      ...newFiles[activeFileIndex],
      _id: fileData._id,
      link: fileData.url,
      type: fileData.fileType,
    };

    // Eğer seçilen satır listenin son elemanı ise, yeni boş bir satır ekle.
    if (activeFileIndex === newFiles.length - 1) {
      newFiles.push({ ...EMPTY_FILE_ROW });
    }
    
    setFormData(prev => ({ ...prev, files: newFiles }));
    setFileModalOpen(false);
    setActiveFileIndex(null);
  };

  // Yeni dosya satırı ekleme
  const addFileRow = () => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, { ...EMPTY_FILE_ROW }]
    }));
  };

  // Dosya satırını kaldırma
  const removeFileRow = (index) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, files: newFiles }));
  };
  // --- END FILE INSERT İŞLEMLERİ ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const filteredFiles = formData.files.filter(file => file.link);
    try {
      if (publication) {
        await updatePublication(publication._id, {
          ...formData,
          files: filteredFiles,
          categories: selectedCategories,
          period: formData.period || null,
          publishDate
        });
        onSuccess(t('publicationUpdated'));
      } else {
        await createPublication({
          ...formData,
          files: filteredFiles,
          categories: selectedCategories,
          period: formData.period || null,
          publishDate
        });
        onSuccess(t('publicationCreated'));
      }
      setFormData(createInitialFormData());
      setSelectedCategories([]); // Seçilen kategorileri sıfırla
      setPublishDate(moment()); // Yayın tarihini sıfırla
    } catch (error) {
      console.error(error);
      onError(t('errorSavingPublication'));
    }
    setIsSubmitting(false);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Kapak resmi ve temel bilgiler */}
          <Grid item xs={12} sm={6}>
            <FeaturedImage
              sx={{ height: 360 }}
              initialFile={formData.coverFile}
              handleFeaturedImage={handleCoverFileSelect}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label={t('Title')}
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('Body')}
                  name="bodyText"
                  value={formData.bodyText}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  size="small"
                  options={periods}
                  getOptionLabel={(option) => {
                    const startDateFormatted = option.startDate
                      ? new Date(option.startDate).toLocaleDateString(dateLocale, {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '';
                    const endDateFormatted = option.endDate
                      ? new Date(option.endDate).toLocaleDateString(dateLocale, {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '';
                    return option?.name
                      ? `${option.name} (${startDateFormatted} - ${endDateFormatted})`
                      : '';
                  }}
                  onChange={handlePeriodChange}
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  value={formData?.period}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('Publication Period')}
                      placeholder={t('Publication Period')}
                      variant="outlined"
                    />
                  )}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="categories-outlined"
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  value={selectedCategories}
                  onChange={handleCategoryChange}
                  filterSelectedOptions
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={t('Publication Categories')}
                      placeholder={t('Publication Categories')}
                    />
                  )}
                  fullWidth
                  size='small'
                />
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={pickerLocale}>
                  <Stack spacing={3} sx={{ minWidth: "100%" }}>
                    <DateTimePicker
                    slotProps={{ textField: { size: 'small' } }}
                      label={t('Publication Date and Time')}
                      value={publishDate}
                      onChange={(value) => setPublishDate(value)}
                      ampm={false}
                      inputFormat="DD/MM/YYYY HH:mm"
                    />
                  </Stack>
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>

          {/* FILE INSERT ALANI */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <strong>{t('Publication Files')}</strong>
                <IconButton onClick={addFileRow} color="primary">
                  <AddIcon />
                </IconButton>
              </Grid>
              {formData.files.map((fileEntry, index) => (
                <Grid container spacing={2} alignItems="center" key={index} sx={{marginLeft:"4px"}}>
                  <Grid item xs={4} >
                    <TextField
                      label={t('File Label')}
                      value={fileEntry.label}
                      onChange={(e) => handleFileFieldChange(index, 'label', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={7}>
                    <TextField
                      label={t('Link')}
                      value={fileEntry.link}
                      onClick={() => openFileModal(index)}
                      InputProps={{
                        readOnly: true,
                      }}
                      fullWidth
                      size="small"
                      placeholder={t('Click to select file')}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton onClick={() => removeFileRow(index)} color="secondary">
                      <RemoveIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Submit Butonu */}
          <Grid item xs={12} container justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {publication ? t('updatePublication') : t('createPublication')}
            </Button>
          </Grid>
        </Grid>
      </form>
      {/* File insert için modal */}
      <FileInsertModal
        open={fileModalOpen}
        onClose={() => setFileModalOpen(false)}
        onInsert={handleFileInsert}
      />
    </Paper>
  );
};

export default PublicationForm;
