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
import { useAuth } from '../../context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Stack } from '@mui/material';
import moment from 'moment';
import 'moment/locale/tr';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const FileInsertModal = ({ open, onClose, onInsert }) => {
  // Seçilen dosyayı tutmak için state ekliyoruz.
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Select File</DialogTitle>
      <DialogContent>
        {/* FileViewer'a gerekli prop'ları veriyoruz */}
        <FileViewer
          onFileSelect={(file) => setSelectedFile(file)}
          onUpload={() => {
            /* Upload işlemleri için gerekli kod buraya eklenebilir */
          }}
          funcButton={{ onClick: () => {}, text: "Upload File" }}
          initialSelectedFiles={[]}
          initialFile={{}}
          multiSelect={false}
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
          Insert
        </Button>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PublicationForm = ({ publication, onSuccess, onError }) => {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periods, setPeriods] = useState([]); // Dönemler için
  const [categories, setCategories] = useState([]); // Kategoriler için
  const [selectedCategories, setSelectedCategories] = useState([]); // Seçilen kategoriler
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(null);
  const [publishDate, setPublishDate] = useState(moment()); // Yayın tarihi için

  // files alanını başlangıçta boş bir nesneyle başlatıyoruz.
  const [formData, setFormData] = useState({
    title: '',
    bodyText: '',
    coverFile: null, // Kapak resmi için File id referansı
    files: [{ _id:undefined, label: '', link: '', type: '' }], // File insert alanları
    period: null,
    categories:[], // Kategori (backend entegrasyonu sonradan yapılacak),
    publishDate:moment()
  });

  useEffect(() => {
    fetchPeriods();
    fetchCategories();
    if (publication) {
      setFormData({
        title: publication.title,
        bodyText: publication.bodyText,
        coverFile: publication.coverFile, // backend'den gelen kapak dosyası id
        files: publication.files && publication.files.length > 0 
                ? publication.files 
                : [{  _id: undefined,label: '', link: '', type: '' }],
        period: publication?.period || null,
        categories: publication.category || []
      });
      setSelectedCategories(publication.categories || []); // Seçilen kategorileri ayarla
      setPublishDate(moment(publication.publishDate)); // Yayın tarihini ayarla
    }
  }, [publication]);

  const fetchPeriods = async () => {
    try {
      const periodsData = await getAllPeriods();
      console.log(periodsData);
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
    // FeaturedImage bileşeninden seçilen dosya bilgisi
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
    console.log("handleFileFieldChange:",value)
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
    console.log('fileData' , fileData)
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
      newFiles.push({ _id: undefined, label: '', link: '', type: '' });
    }
    
    setFormData(prev => ({ ...prev, files: newFiles }));
    setFileModalOpen(false);
    console.log("newFiles",newFiles)
    console.log("formData.files", formData.files)
    setActiveFileIndex(null);
  };

  // Yeni dosya satırı ekleme
  const addFileRow = () => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, { _id: undefined, label: '', link: '', type: '' }]
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

console.log("formDataBefore submission:" , { ...formData, files:filteredFiles, categories: selectedCategories, publishDate } )
    try {
      if (publication) {
        await updatePublication(publication._id, { ...formData, files:filteredFiles, categories: selectedCategories, publishDate });
        onSuccess(t('publicationUpdated'));
      } else {
       
        await createPublication({ ...formData, files:filteredFiles, categories: selectedCategories, publishDate });
        onSuccess(t('publicationCreated'));
      }
      // Formu resetleyelim
      setFormData({
        title: '',
        bodyText: '',
        coverFile: null,
        files: [{_id:undefined, label: '', link: '', type: '' }],
        period: null,
        categories:[],
        publishDate:moment()
      });
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
                      ? new Date(option.startDate).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '';
                    const endDateFormatted = option.endDate
                      ? new Date(option.endDate).toLocaleDateString('tr-TR', {
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
                  renderInput={(params) => <TextField {...params} label={t('Period')} variant="outlined" />}
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
                      label={t('Category')}
                      placeholder={t('Category')}
                    />
                  )}
                  fullWidth
                  size='small'
                />
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
                  <Stack spacing={3} sx={{ minWidth: "100%" }}>
                    <DateTimePicker
                    slotProps={{ textField: { size: 'small' } }}
                      label="Yayın Tarihi ve Saati"
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
                <strong>{t('Files')}</strong>
                <IconButton onClick={addFileRow} color="primary">
                  <AddIcon />
                </IconButton>
              </Grid>
              {formData.files.map((fileEntry, index) => (
                <Grid container spacing={2} alignItems="center" key={index} sx={{marginLeft:"4px"}}>
                  <Grid item xs={4} >
                    <TextField
                      label={t('Text')}
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
                      placeholder={t('clickToSelectFile')}
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